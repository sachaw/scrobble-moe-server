import { decode, encode } from "universal-base64";
import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from "@simplewebauthn/server";
import {
  AuthenticationResponseJSON,
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
  RegistrationResponseJSON,
} from "@simplewebauthn/typescript-types";
import { createId } from "@paralleldrive/cuid2";
import { builder } from "../../builder.js";
import { getPlexAccount } from "../../lib/auth/utils.js";
import { env } from "../../lib/env.js";
import { WebauthnAction } from "@prisma/client";
import base64url from "base64url";

export class WebauthnInput {
  type: WebauthnAction;
  verification: string;
  plexToken: string;
}

export class AuthCheckResponse {
  authenticated: boolean;
}

// Input types

export const plexAuthenticationInput = builder.inputType(
  "AuthenticationInput",
  {
    description: "Input for the plex authentication flow",
    fields: (t) => ({
      plexToken: t.string({ required: true }),
    }),
  },
);

export const webauthnInput = builder.inputType("WebauthnInput", {
  description: "Input for the webauthn registration and authentication flows",
  fields: (t) => ({
    verification: t.string({ required: true }),
    plexToken: t.string({ required: true }),
  }),
});

// Response types

export class PlexAuthenticationResponse {
  action: WebauthnAction;
  webauthnOptions: string;
  plexUser: PlexUser;
}

export const plexAuthenticationResponse = builder.objectType(
  PlexAuthenticationResponse,
  {
    name: "PlexAuthenticationResponse",
    description:
      "Response for the plex authentication flow, contains the webauthn options and the plex user data",
    fields: (t) => ({
      type: t.expose("action", {
        type: WebauthnAction,
      }),
      webauthnOptions: t.exposeString("webauthnOptions"),
      plexUser: t.expose("plexUser", { type: plexUser }),
    }),
  },
);

export class PlexUser {
  username: string;
  avatar: string;
}

export const plexUser = builder.objectType(PlexUser, {
  name: "PlexUser",
  description: "Plex user data, used to display the user's avatar and username",
  fields: (t) => ({
    username: t.exposeString("username"),
    avatar: t.exposeString("avatar"),
  }),
});

export class WebauthnResponse {
  success: boolean;
}

export const webauthnResponse = builder.objectType(WebauthnResponse, {
  name: "WebauthnResponse",
  description:
    "Response for the webauthn registration and authentication flows",
  fields: (t) => ({
    success: t.exposeBoolean("success"),
  }),
});

builder.mutationField("webauthn", (t) =>
  t.field({
    type: webauthnResponse,
    args: {
      input: t.arg({
        type: webauthnInput,
        required: true,
      }),
    },
    resolve: async (root, args, ctx) => {
      const plexAccountData = await getPlexAccount(args.input.plexToken);

      const user = await ctx.prisma.user.findUnique({
        where: {
          plexId: plexAccountData.user.id,
        },
      });

      if (!user) {
        // throw new AuthenticationError("User not found");
        throw new Error("User not found");
      }

      if (!user.challenge) {
        // throw new AuthenticationError("Challenge has not been generated yet.");
        throw new Error("Challenge has not been generated yet.");
      }

      switch (
        user.challangeUsage //we need to choose if it is a registration or authentication not have the client report it/ or maybe not as the user has already provided there plex pin.
      ) {
        case WebauthnAction.REGISTRATION: {
          const authenticatorData = JSON.parse(
            decode(args.input.verification),
          ) as RegistrationResponseJSON;
          const verification = await verifyRegistrationResponse({
            response: authenticatorData,
            expectedChallenge: user.challenge,
            expectedOrigin: env.RP_ORIGIN,
            expectedRPID: env.RP_ID,
          });

          if (!verification.verified) {
            // throw new AuthenticationError("Challenge Failed");
            throw new Error("Challenge Failed");
          }

          if (!verification.registrationInfo) {
            // throw new AuthenticationError("Registration data malformed");
            throw new Error("Registration data malformed");
          }

          await ctx.prisma.authenticator.create({
            data: {
              id: createId(),
              AAGUID: verification.registrationInfo.aaguid,
              credentialID: Buffer.from(
                verification.registrationInfo.credentialID,
              ),
              credentialPublicKey: Buffer.from(
                verification.registrationInfo.credentialPublicKey,
              ),
              counter: verification.registrationInfo.counter,
              revoked: false,
              // transports:
              //   authenticatorData.transports?.map((transport) => {
              //     return transport.toUpperCase() as TransportType;
              //   }) ?? [],
              user: {
                connect: {
                  id: user.id,
                },
              },
            },
          });

          // const tokens = await generateTokens(ctx.prisma, user);

          // ctx.setTokens(tokens);

          return {
            success: true,
          };
        }

        case WebauthnAction.AUTHENTICATION: {
          const response = JSON.parse(
            decode(args.input.verification),
          ) as AuthenticationResponseJSON;
          const authenticator = await ctx.prisma.authenticator.findUnique({
            where: {
              credentialID: base64url.toBuffer(response.rawId),
            },
          });

          if (!authenticator) {
            // throw new AuthenticationError("Authenticator not found");
            throw new Error("Authenticator not found");
          }

          const verification = await verifyAuthenticationResponse({
            response,
            expectedChallenge: user.challenge,
            expectedOrigin: env.RP_ORIGIN,
            expectedRPID: env.RP_ID,
            authenticator: {
              counter: authenticator.counter,
              credentialID: authenticator.credentialID,
              credentialPublicKey: authenticator.credentialPublicKey,
              transports: authenticator.transports.map(
                (transport) =>
                  transport.toLowerCase() as AuthenticatorTransport,
              ),
            },
          });

          if (!verification.verified) {
            // throw new AuthenticationError("Challenge Failed");
            throw new Error("Challenge Failed");
          }

          await ctx.prisma.authenticator.update({
            where: {
              credentialID: authenticator.credentialID,
            },
            data: {
              counter: verification.authenticationInfo.newCounter,
            },
          });

          // const tokens = await generateTokens(ctx.prisma, user);

          // ctx.setTokens(tokens);

          return {
            success: true,
          };
        }
      }
      return {
        success: false,
      };
    },
  }),
);
