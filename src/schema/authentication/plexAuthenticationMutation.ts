import { createId } from "@paralleldrive/cuid2";
import { builder } from "../../builder.js";
import { getPlexAccount } from "../../lib/auth/utils.js";
import { PlexAuthenticationResponse, plexAuthenticationInput } from "./auth.js";
import {
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
} from "@simplewebauthn/typescript-types";
import { WebauthnAction } from "@prisma/client";
import { generateRegistrationOptions } from "@simplewebauthn/server/dist/registration/generateRegistrationOptions.js";
import { env } from "../../lib/env.js";
import { generateAuthenticationOptions } from "@simplewebauthn/server/dist/authentication/generateAuthenticationOptions.js";
import { encode } from "universal-base64";

builder.mutationField("plexAuthentication", (t) =>
  t.field({
    type: PlexAuthenticationResponse,
    args: {
      input: t.arg({
        type: plexAuthenticationInput,
        required: true,
      }),
    },
    resolve: async (root, args, ctx) => {
      const plexAccountData = await getPlexAccount(args.input.plexToken);

      const user = await ctx.prisma.user.upsert({
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
          id: createId(),
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
      let challangeUsage: WebauthnAction;

      if (user.authenticators.length === 0) {
        challangeUsage = WebauthnAction.REGISTRATION;
        webauthnOptions = generateRegistrationOptions({
          rpID: env.RP_ID,
          rpName: env.RP_NAME,
          userID: user.id,
          userName: user.username,
          attestationType: "direct",
          authenticatorSelection: {
            requireResidentKey: true,
          },
        });
      } else {
        challangeUsage = WebauthnAction.AUTHENTICATION;
        webauthnOptions = generateAuthenticationOptions({
          rpID: env.RP_ID,
          userVerification: "required",
          allowCredentials: user.authenticators
            .filter((a) => !a.revoked)
            .map((authenticator) => {
              return {
                id: authenticator.credentialID,
                transports: authenticator.transports.map(
                  (transport) =>
                    transport.toLowerCase() as AuthenticatorTransport,
                ),
                type: "public-key",
              };
            }),
        });
      }
      await ctx.prisma.user.update({
        data: {
          challangeUsage,
          challenge: webauthnOptions.challenge,
          challengeExpiresAt: new Date(new Date().getTime() + 1000 * 60 * 1),
        },
        where: {
          id: user.id,
        },
      });

      return {
        action: challangeUsage,
        webauthnOptions: encode(JSON.stringify(webauthnOptions)),
        plexUser: {
          username: plexAccountData.user.username,
          avatar: plexAccountData.user.thumb,
        },
      };
    },
  }),
);
