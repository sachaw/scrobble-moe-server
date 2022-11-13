import { encode } from "universal-base64";

import { generateAuthenticationOptions, generateRegistrationOptions } from "@simplewebauthn/server";
import {
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
} from "@simplewebauthn/typescript-types";

import { builder } from "../builder.js";
import { getPlexAccount } from "../lib/auth/utils.js";
import { env } from "../lib/env.js";
import { prisma } from "../lib/prisma.js";
import { AuthenticationInput, AuthenticationType, authModel, AuthResponse } from "./models/auth.js";
import { authenticatorModel } from "./models/authenticator.js";
import { linkedAccountModel } from "./models/linkedAccount.js";
import { scrobbleModel } from "./models/scrobble.js";
import { scrobbleProviderStatusModel } from "./models/scrobbleProviderStatus.js";
import { serverModel } from "./models/server.js";
import { tokenModel } from "./models/token.js";
import { userModel } from "./models/user.js";
import { registerEnums } from "./registerEnums.js";
import { registerScalars } from "./registerScalars.js";

registerScalars();
registerEnums();

authenticatorModel();
linkedAccountModel();
scrobbleModel();
scrobbleProviderStatusModel();
serverModel();
tokenModel();
userModel();

authModel();
const authInput = AuthenticationInput();

builder.queryType({
  fields: (t) => ({
    user: t.prismaField({
      type: "User",
      nullable: true,
      args: {
        id: t.arg.id({ required: true }),
      },
      resolve: (query, root, args) =>
        prisma.user.findUnique({
          ...query,
          where: { id: String(args.id) },
        }),
    }),
  }),
});

builder.mutationType({
  fields: (t) => ({
    authenticate: t.field({
      type: AuthResponse,
      args: {
        input: t.arg({
          type: authInput,
          required: true,
        }),
      },
      resolve: async (root, args) => {
        const plexAccountData = await getPlexAccount(args.input.plexToken);

        const user = await prisma.user.upsert({
          where: {
            plexId: plexAccountData.user.id,
          },
          include: {
            authenticators: true,
          },
          update: {
            email: plexAccountData.user.email,
            plexAuthToken: args.input.plexToken,
            thumb: plexAccountData.user.thumb,
            username: plexAccountData.user.username,
          },
          create: {
            email: plexAccountData.user.email,
            plexAuthToken: args.input.plexToken,
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
          const authenticators = await prisma.authenticator.findMany({
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

        await prisma.user.update({
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
      },
    }),
  }),
});

export const schema = builder.toSchema();
