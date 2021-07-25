import axios from "axios";
import { PlexOauth } from "plex-oauth";
import { Arg, Authorized, Ctx, Mutation, Query, Resolver } from "type-graphql";

import { AuthenticationError } from "@frontendmonster/graphql-utils";
import { Role } from "@prisma/client";
import {
  generateAssertionOptions,
  generateAttestationOptions,
  verifyAttestationResponse,
} from "@simplewebauthn/server";
import { AuthenticatorTransport } from "@simplewebauthn/typescript-types";

import { Context } from "../lib/context";
import { generateTemporaryToken, generateTokens } from "../utils/auth";
import {
  AssertionOptions,
  AttestationOptions,
  AttestationVerificationInput,
  PlexLoginUrl,
  PlexPinInput,
  TemporaryTokenResponse,
  TokenResponse,
} from "./auth";

@Resolver(PlexLoginUrl)
export class AuthResolver {
  constructor(private plexOauth: PlexOauth) {
    this.plexOauth = new PlexOauth({
      origin: "http://localhost:4000",
      clientIdentifier: "7f9de3ba-e12b-11ea-87d0-0242ac130003",
      product: "scrobble.moe",
      device: "Internet",
      version: "1",
      forwardUrl: "",
    });
  }

  @Query(() => [PlexLoginUrl])
  async plexLoginURL() {
    const [url, token] = await this.plexOauth.requestHostedLoginURL();
    return [
      {
        url,
        token,
      },
    ];
  }

  @Authorized(Role.ADMIN, Role.USER)
  @Query((returns) => AssertionOptions)
  async generateAssertionOptions(@Ctx() ctx: Context) {
    const authenticators = await ctx.prisma.authenticator.findMany({
      where: {
        revoked: false,
        user: {
          id: ctx.user.id,
        },
      },
    });

    const options = generateAssertionOptions({
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
    });

    return {
      assertionOptions: JSON.stringify(options),
    };
  }

  @Authorized(Role.ADMIN, Role.USER)
  @Query((returns) => AttestationOptions)
  async generateAttestationOptions(@Ctx() ctx: Context) {
    const revokedAuthenticators = await ctx.prisma.authenticator.findMany({
      where: {
        revoked: true,
        user: {
          id: ctx.user.id,
        },
      },
    });

    const options = generateAttestationOptions({
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

    return {
      attestationOptions: JSON.stringify(options),
    };
  }

  @Mutation(() => TemporaryTokenResponse)
  async plexPinSignin(
    @Ctx() ctx: Context,
    @Arg("plexPinInput")
    plexPinInput: PlexPinInput
  ) {
    const token = await this.plexOauth.checkForAuthToken(plexPinInput.pin);

    if (!token) {
      return null;
    }

    axios
      .get("https://plex.tv/users/account.json", {
        headers: {
          "X-Plex-Token": token ?? "",
          Accept: "application/json",
        },
      })
      .then(async (response) => {
        const user = await ctx.prisma.user.upsert({
          where: {
            plexUUID: response.data.user.uuid,
          },
          update: {
            email: response.data.user.email,
            plexAuthToken: token,
            thumb: response.data.user.thumb,
            username: response.data.user.username,
          },
          create: {
            email: response.data.user.email,
            plexAuthToken: token,
            plexId: response.data.user.id,
            plexUUID: response.data.user.uuid,
            thumb: response.data.user.thumb,
            username: response.data.user.username,
          },
        });

        return await generateTemporaryToken(ctx.prisma, user);
      });
  }

  @Authorized(Role.ADMIN, Role.USER)
  @Mutation((returns) => TokenResponse)
  async verifyAttestation(
    @Arg("attestationVerificationInput")
    attestationVerificationInput: AttestationVerificationInput,
    @Ctx() ctx: Context
  ): Promise<TokenResponse> {
    if (
      !ctx.user.authenticationChallenge ||
      ctx.user.authenticationChallengeExpiresAt < new Date()
    ) {
      throw new AuthenticationError("Invalid or expired challenge");
    }

    const verification = await verifyAttestationResponse({
      credential: JSON.parse(attestationVerificationInput.attestationVerificationInput),
      expectedChallenge: ctx.user.authenticationChallenge,
      expectedOrigin: process.env.RP_ORIGIN,
      expectedRPID: process.env.RP_ID,
    });

    if (!verification.verified) {
      throw new AuthenticationError("Challenge Failed");
    }

    console.log(verification);

    await ctx.prisma.authenticator.create({
      data: {
        AAGUID: verification.attestationInfo.aaguid,
        credentialID: verification.attestationInfo.credentialID,
        credentialPublicKey: verification.attestationInfo.credentialPublicKey,
        counter: verification.attestationInfo.counter,
        revoked: false,
        transports: [], // TODO: Add transports from attestation
        user: {
          connect: {
            id: ctx.user.id,
          },
        },
      },
    });

    return await generateTokens(ctx.prisma, ctx.user);
  }
}
