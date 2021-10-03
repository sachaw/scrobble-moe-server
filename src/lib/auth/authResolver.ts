import base64url from "base64url";
import { Arg, Ctx, Mutation, Query } from "type-graphql";
import { decode, encode } from "universal-base64";

import { AuthenticationError } from "@frontendmonster/graphql-utils";
import { Transport as TransportType } from "@prisma/client";
import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from "@simplewebauthn/server";
import {
  AuthenticationCredentialJSON,
  AuthenticatorTransport,
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
  RegistrationCredentialJSON,
} from "@simplewebauthn/typescript-types";

import { generateTokens } from "../../utils/auth.js";
import { Context } from "../context.js";
import { env } from "../env.js";
import {
  AuthCheckResponse,
  AuthenticationInput,
  AuthenticationType,
  AuthResponse,
  TokenResponse,
  WebauthnInput,
} from "./auth.js";
import { getPlexAccount } from "./utils.js";

export class AuthResolver {
  @Mutation(() => AuthResponse)
  async authenticate(
    @Ctx() ctx: Context,
    @Arg("authenticationInput")
    authenticationInput: AuthenticationInput
  ): Promise<AuthResponse> {
    const plexAccountData = await getPlexAccount(authenticationInput.plexToken);

    const user = await ctx.prisma.user.upsert({
      where: {
        plexId: plexAccountData.user.id,
      },
      include: {
        authenticators: true,
      },
      update: {
        email: plexAccountData.user.email,
        plexAuthToken: authenticationInput.plexToken,
        thumb: plexAccountData.user.thumb,
        username: plexAccountData.user.username,
      },
      create: {
        email: plexAccountData.user.email,
        plexAuthToken: authenticationInput.plexToken,
        plexId: plexAccountData.user.id,
        thumb: plexAccountData.user.thumb,
        username: plexAccountData.user.username,
      },
    });

    let webauthnOptions:
      | PublicKeyCredentialCreationOptionsJSON
      | PublicKeyCredentialRequestOptionsJSON;

    if (user.authenticators.length === 0) {
      // const revokedAuthenticators = await ctx.prisma.authenticator.findMany({
      //   where: {
      //     revoked: true,
      //     user: {
      //       id: user.id,
      //     },
      //   },
      // });

      webauthnOptions = generateRegistrationOptions({
        rpID: env.RP_ID,
        rpName: env.RP_NAME,
        userID: user.id,
        userName: user.username,
        attestationType: "direct",
        authenticatorSelection: {
          requireResidentKey: true,
        },
        // excludeCredentials: revokedAuthenticators.map((authenticator) => {
        //   return {
        //     id: authenticator.credentialID,
        //     transports: authenticator.transports.map(
        //       (transport) => transport.toLowerCase() as AuthenticatorTransport
        //     ),
        //     type: "public-key",
        //   };
        // }),
      });
    } else {
      const authenticators = await ctx.prisma.authenticator.findMany({
        where: {
          revoked: false,
          user: {
            id: user.id,
          },
        },
      });

      webauthnOptions = generateAuthenticationOptions({
        rpID: env.RP_ID,
        userVerification: "required",
        allowCredentials: authenticators.map((authenticator) => {
          return {
            id: authenticator.credentialID,
            transports: authenticator.transports.map(
              (transport) => transport.toLowerCase() as AuthenticatorTransport
            ),
            type: "public-key",
          };
        }),
      });
    }

    const challengeExpires = new Date(new Date().getTime() + 1000 * 60 * 1);

    await ctx.prisma.user.update({
      data: {
        authenticationChallenge: webauthnOptions.challenge,
        authenticationChallengeExpiresAt: challengeExpires,
      },
      where: {
        id: user.id,
      },
    });

    return {
      type: user.authenticators.length
        ? AuthenticationType.AUTHENTICATION
        : AuthenticationType.REGISTRATION,
      webauthnOptions: encode(JSON.stringify(webauthnOptions)),
      plexUser: {
        username: plexAccountData.user.username,
        avatar: plexAccountData.user.thumb,
      },
    };
  }

  @Mutation(() => TokenResponse)
  async webauthn(
    @Arg("WebauthnInput")
    webauthnInput: WebauthnInput,
    @Ctx() ctx: Context
  ): Promise<TokenResponse> {
    const plexAccountData = await getPlexAccount(webauthnInput.plexToken);

    const user = await ctx.prisma.user.findUnique({
      where: {
        plexId: plexAccountData.user.id,
      },
    });

    if (!user) {
      throw new AuthenticationError("User not found");
    }

    if (!user.authenticationChallenge) {
      throw new AuthenticationError("Challenge has not been generated yet.");
    }

    switch (webauthnInput.type) {
      case AuthenticationType.REGISTRATION: {
        const authenticatorData = JSON.parse(
          decode(webauthnInput.verification)
        ) as RegistrationCredentialJSON;
        const verification = await verifyRegistrationResponse({
          credential: authenticatorData,
          expectedChallenge: user.authenticationChallenge,
          expectedOrigin: env.RP_ORIGIN,
          expectedRPID: env.RP_ID,
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
            transports:
              authenticatorData.transports?.map((transport) => {
                return transport.toUpperCase() as TransportType;
              }) ?? [],
            user: {
              connect: {
                id: user.id,
              },
            },
          },
        });

        const tokens = await generateTokens(ctx.prisma, user);

        ctx.setTokens(tokens);

        return {
          success: true,
        };
      }

      case AuthenticationType.AUTHENTICATION: {
        const authenticatorData = JSON.parse(
          decode(webauthnInput.verification)
        ) as AuthenticationCredentialJSON;
        const authenticator = await ctx.prisma.authenticator.findUnique({
          where: {
            credentialID: base64url.toBuffer(authenticatorData.rawId),
          },
        });

        if (!authenticator) {
          throw new AuthenticationError("Authenticator not found");
        }

        const verification = verifyAuthenticationResponse({
          authenticator: {
            counter: authenticator.counter,
            credentialID: authenticator.credentialID,
            credentialPublicKey: authenticator.credentialPublicKey,
            transports: authenticator.transports.map(
              (transport) => transport.toLowerCase() as AuthenticatorTransport
            ),
          },
          credential: authenticatorData,
          expectedChallenge: user.authenticationChallenge,
          expectedOrigin: env.RP_ORIGIN,
          expectedRPID: env.RP_ID,
        });

        if (!verification.verified) {
          throw new AuthenticationError("Challenge Failed");
        }

        await ctx.prisma.authenticator.update({
          where: {
            credentialID: authenticator.credentialID,
          },
          data: {
            counter: verification.authenticationInfo.newCounter,
          },
        });

        const tokens = await generateTokens(ctx.prisma, user);

        ctx.setTokens(tokens);

        return {
          success: true,
        };
      }
    }
  }

  @Query(() => AuthCheckResponse)
  authCheck(@Ctx() ctx: Context): AuthCheckResponse {
    return {
      authenticated: Boolean(ctx.user),
    };
  }
}
