import { Provider, LinkedAccount } from "@prisma/client";

import { builder } from "../../builder.js";
import { env } from "../../lib/env.js";
import got from "got";
import axios, { AxiosError } from "axios";
import { Anilist } from "../../lib/providers/anilist.js";
import { prisma } from "../../lib/prisma.js";
import { createId } from "@paralleldrive/cuid2";

export interface IAnilistAuthVariables {
  grant_type: string;
  client_id: number;
  client_secret: string;
  redirect_uri: string;
  code: string;
}

export interface IAnilistAuthResponse {
  data: {
    token_type: string;
    expires_in: number;
    access_token: string;
    refresh_token: string;
  };
}

const anilistService = new Anilist();

// Input types

const addLinkedAccountInput = builder.inputType("AddLinkedAccountInput", {
  description: "",
  fields: (t) => ({
    code: t.string({ required: true }),
  }),
});

// Response types

class LinkedAccountResponse implements LinkedAccount {
  id!: string;
  createdAt!: Date;
  updatedAt!: Date;
  provider!: Provider;
  accountId!: string;
  accessToken!: string;
  accessTokenExpires!: Date;
  refreshToken!: string;
  userId!: string;
}

export const linkedAccountModel = () => {
  builder.prismaObject("LinkedAccount", {
    fields: (t) => ({
      id: t.exposeID("id"),
      createdAt: t.expose("createdAt", { type: "Date" }),
      updatedAt: t.expose("updatedAt", { type: "Date" }),
      provider: t.expose("provider", { type: Provider }),
      accountId: t.exposeString("accountId"),
      // accessToken: t.exposeString("accessToken"), //TODO: Do no expose
      // accessTokenExpires: t.expose("accessTokenExpires"),
      // refreshToken: t.exposeString("refreshToken"), //TODO: Do no expose

      scrobbles: t.relation("scrobbles"),
      user: t.relation("user"),
    }),
  });

  builder.mutationField("addLinkedAccount", (t) =>
    t.prismaField({
      type: "LinkedAccount",
      args: {
        input: t.arg({
          type: addLinkedAccountInput,
          required: true,
        }),
      },
      resolve: async (root, args, ctx) => {
        const anilistToken = await axios
          .post<IAnilistAuthVariables, IAnilistAuthResponse>(
            "https://anilist.co/api/v2/oauth/token",
            {
              grant_type: "authorization_code",
              client_id: env.ANILIST_ID,
              client_secret: env.ANILIST_SECRET,
              redirect_uri: env.ANILIST_REDIRECT_URL,
              code: args.input.code,
            },
            {
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
            },
          )
          .catch((error: Error | AxiosError) => {
            if (axios.isAxiosError(error)) {
              switch (error.response?.status) {
                case 403:
                  // throw new AuthenticationError("Invalid request");
                  throw new Error("Invalid request");
                case 400:
                  // throw new AuthenticationError(
                  //   "Expired or already used code provided",
                  // );
                  throw new Error("Expired or already used code provided");
                default:
                  // throw new AuthenticationError(error.message);
                  throw new Error(error.message);
              }
            } else {
              throw new Error(error.message);
            }
          });

        console.log(anilistToken);

        const anilistTokenResponse = anilistToken.data;

        anilistService.setAccessToken(anilistTokenResponse.access_token);

        const accountId = await anilistService.getUserId();

        const linkedAccount = await prisma.linkedAccount.upsert({
          where: {
            accountId,
          },
          create: {
            id: createId(),
            accessToken: anilistTokenResponse.access_token,
            refreshToken: anilistTokenResponse.refresh_token,
            accessTokenExpires: new Date(
              new Date().getTime() + anilistTokenResponse.expires_in * 1000,
            ),
            accountId,
            provider: "ANILIST",
            user: {
              connect: {
                id: "tillhfwsrjig6395ux5ajjd4",
              },
            },
          },
          update: {
            accessToken: anilistTokenResponse.access_token,
            refreshToken: anilistTokenResponse.refresh_token,
            accessTokenExpires: new Date(
              new Date().getTime() + anilistTokenResponse.expires_in * 1000,
            ),
          },
        });

        return linkedAccount;
      },
    }),
  );
};
