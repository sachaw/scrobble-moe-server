import axios from "axios";
import { PlexOauth } from "plex-oauth";
import { Arg, Authorized, Ctx, Mutation, Query, Resolver } from "type-graphql";

import { AuthenticationError } from "@frontendmonster/graphql-utils";
import { Role } from "@prisma/client";
import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  VerifiedAuthenticationResponse,
  VerifiedRegistrationResponse,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from "@simplewebauthn/server";
import {
  AuthenticationCredentialJSON,
  AuthenticatorTransport,
  RegistrationCredentialJSON,
} from "@simplewebauthn/typescript-types";

import { Context } from "../lib/context";
import { generateTemporaryToken, generateTokens } from "../utils/auth";
import {
  PlexLoginUrl,
  PlexPinCheck,
  PlexPinInput,
  TemporaryTokenResponse,
  TokenResponse,
  WebauthnOptions,
  WebauthnOptionsInput,
  WebauthnRequestType,
  WebauthnVerificationInput,
} from "./auth";

@Resolver(PlexLoginUrl)
export class AuthResolver {
  constructor(private plexOauth: PlexOauth) {
    this.plexOauth = new PlexOauth({
      clientIdentifier: "7f9de3ba-e12b-11ea-87d0-0242ac130003",
      product: "scrobble.moe",
      device: "Internet",
      version: "1",
      forwardUrl: "",
    });
  }

  @Query(() => PlexLoginUrl)
  async plexLoginURL(): Promise<PlexLoginUrl> {
    const [url, pin] = await this.plexOauth.requestHostedLoginURL();
    return {
      url,
      pin,
    };
  }

  @Query(() => PlexPinCheck)
  async checkPin(
    @Arg("plexPinInput") plexPinInput: PlexPinInput,
    @Ctx() ctx: Context
  ): Promise<PlexPinCheck> {
    const potentialUser = await ctx.prisma.user.findUnique({
      where: {
        lastPlexPin: plexPinInput.pin,
      },
      include: {
        authenticators: true,
      },
    });

    if (!potentialUser) {
      const token = await this.plexOauth.checkForAuthToken(plexPinInput.pin);

      if (!token) {
        return {
          authenticated: false,
          type: WebauthnRequestType.UNKNOWN,
        };
      }

      const response = await axios.get("https://plex.tv/users/account.json", {
        headers: {
          "X-Plex-Token": token ?? "",
          Accept: "application/json",
        },
      });

      await ctx.prisma.user.upsert({
        where: {
          plexUUID: response.data.user.uuid,
        },
        update: {
          email: response.data.user.email,
          plexAuthToken: token,
          thumb: response.data.user.thumb,
          username: response.data.user.username,
          lastPlexPin: plexPinInput.pin,
        },
        create: {
          email: response.data.user.email,
          plexAuthToken: token,
          plexId: response.data.user.id,
          plexUUID: response.data.user.uuid,
          thumb: response.data.user.thumb,
          username: response.data.user.username,
          lastPlexPin: plexPinInput.pin,
        },
      });
    }
    return {
      authenticated: true,
      type: potentialUser?.authenticators.length
        ? WebauthnRequestType.AUTHENTICATION
        : WebauthnRequestType.REGISTRATION,
    };
  }

  @Authorized(Role.ADMIN, Role.USER)
  @Query(() => WebauthnOptions)
  async generateWebauthnOptions(
    @Arg("webauthnOptionsInput") webauthnOptionsInput: WebauthnOptionsInput,
    @Ctx() ctx: Context
  ): Promise<WebauthnOptions> {
    if (!ctx.user || !ctx.user.username) {
      throw new AuthenticationError("User not in context");
    }

    let webauthnOptions: WebauthnOptions;

    switch (webauthnOptionsInput.type) {
      case WebauthnRequestType.AUTHENTICATION: {
        const authenticators = await ctx.prisma.authenticator.findMany({
          where: {
            revoked: false,
            user: {
              id: ctx.user.id,
            },
          },
        });

        webauthnOptions = {
          webauthnOptions: JSON.stringify(
            generateAuthenticationOptions({
              rpID: process.env.RP_ID,
              allowCredentials: authenticators.map((authenticator) => {
                return {
                  id: authenticator.credentialID,
                  transports: authenticator.transports.map(
                    (transport) => transport.toLowerCase() as AuthenticatorTransport
                  ),
                  type: "public-key",
                };
              }),
            })
          ),
        };

        break;
      }

      case WebauthnRequestType.REGISTRATION: {
        const revokedAuthenticators = await ctx.prisma.authenticator.findMany({
          where: {
            revoked: true,
            user: {
              id: ctx.user.id,
            },
          },
        });

        if (!process.env.RP_ORIGIN || !process.env.RP_ID || !process.env.RP_NAME) {
          throw new Error("Missing RP_ORIGIN, RP_ID or RP_NAME");
        }

        const options = generateRegistrationOptions({
          rpID: process.env.RP_ID,
          rpName: process.env.RP_NAME,
          userID: ctx.user.id,
          userName: ctx.user.username,
          attestationType: "direct",
          authenticatorSelection: {
            requireResidentKey: true,
          },
          excludeCredentials: revokedAuthenticators.map((authenticator) => {
            return {
              id: authenticator.credentialID,
              transports: authenticator.transports.map(
                (transport) => transport.toLowerCase() as AuthenticatorTransport
              ),
              type: "public-key",
            };
          }),
        });

        const challengeExpires = new Date(new Date().getTime() + 1000 * 60 * 1); // 1 minute

        await ctx.prisma.user.update({
          data: {
            authenticationChallenge: options.challenge,
            authenticationChallengeExpiresAt: challengeExpires,
          },
          where: {
            id: ctx.user.id,
          },
        });

        webauthnOptions = {
          webauthnOptions: JSON.stringify(options),
        };

        break;
      }
    }

    return webauthnOptions;
  }

  @Mutation(() => TemporaryTokenResponse)
  async plexPinSignin(
    @Ctx() ctx: Context,
    @Arg("plexPinInput")
    plexPinInput: PlexPinInput
  ): Promise<TemporaryTokenResponse> {
    const user = await ctx.prisma.user.findUnique({
      where: {
        lastPlexPin: plexPinInput.pin,
      },
    });

    if (!user) {
      throw new AuthenticationError(
        "Pin does not exist, please generate and authenticate pin first"
      );
    }

    await ctx.prisma.user.update({
      data: {
        lastPlexPin: undefined,
      },
      where: {
        id: user.id,
      },
    });

    return await generateTemporaryToken(ctx.prisma, user);
  }

  @Authorized(Role.ADMIN, Role.USER)
  @Mutation(() => TokenResponse)
  async verifyWebauthn(
    @Arg("webauthnVerificationInput")
    webauthnVerificationInput: WebauthnVerificationInput,
    @Ctx() ctx: Context
  ): Promise<TokenResponse> {
    if (
      !ctx.user ||
      !ctx.user.authenticationChallenge ||
      (ctx.user.authenticationChallengeExpiresAt ?? new Date()) < new Date()
    ) {
      throw new AuthenticationError("Invalid or expired challenge");
    }

    const authenticatorData = JSON.parse(webauthnVerificationInput.verificationInput) as
      | RegistrationCredentialJSON
      | AuthenticationCredentialJSON;

    let verification: VerifiedRegistrationResponse | VerifiedAuthenticationResponse;

    if (!process.env.RP_ORIGIN || !process.env.RP_ID) {
      throw new Error("Missing RP_ORIGIN or RP_ID");
    }

    switch (webauthnVerificationInput.type) {
      case WebauthnRequestType.REGISTRATION: {
        verification = await verifyRegistrationResponse({
          credential: authenticatorData as RegistrationCredentialJSON,
          expectedChallenge: ctx.user.authenticationChallenge,
          expectedOrigin: process.env.RP_ORIGIN,
          expectedRPID: process.env.RP_ID,
        });

        if (!verification.verified) {
          throw new AuthenticationError("Challenge Failed");
        }

        if (!verification.registrationInfo) {
          throw new AuthenticationError("Registration data malformed");
        }

        await ctx.prisma.authenticator.create({
          data: {
            AAGUID: verification.registrationInfo.aaguid,
            credentialID: verification.registrationInfo.credentialID,
            credentialPublicKey: verification.registrationInfo.credentialPublicKey,
            counter: verification.registrationInfo.counter,
            revoked: false,
            transports: [], // TODO: Add transports from registration
            user: {
              connect: {
                id: ctx.user.id,
              },
            },
          },
        });

        return await generateTokens(ctx.prisma, ctx.user);

        break;
      }

      case WebauthnRequestType.AUTHENTICATION: {
        const authenticator = await ctx.prisma.authenticator.findUnique({
          where: {
            credentialID: Buffer.from(authenticatorData.rawId),
          },
        });

        if (!authenticator) {
          throw new AuthenticationError("Authenticator not found");
        }

        verification = verifyAuthenticationResponse({
          authenticator: {
            counter: authenticator.counter,
            credentialID: authenticator.credentialID,
            credentialPublicKey: authenticator.credentialPublicKey,
            transports: authenticator.transports.map(
              (transport) => transport.toLowerCase() as AuthenticatorTransport
            ),
          },
          credential: authenticatorData as AuthenticationCredentialJSON,
          expectedChallenge: ctx.user.authenticationChallenge,
          expectedOrigin: process.env.RP_ORIGIN,
          expectedRPID: process.env.RP_ID,
        });

        if (!verification.verified) {
          throw new AuthenticationError("Challenge Failed");
        }

        console.log(verification);

        // await ctx.prisma.authenticator.update({
        //   data: {
        //     counter: authenticatorData.response.
        //   }
        // })

        console.log(authenticator);

        console.log(authenticatorData);

        //upsert with new counter

        return await generateTokens(ctx.prisma, ctx.user);

        break;
      }
    }
  }
}
