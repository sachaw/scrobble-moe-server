import "reflect-metadata";

import { Arg, Ctx, Mutation, Resolver } from "type-graphql";

import { Context } from "../context.js";
import { Anilist } from "../providers/anilist.js";
import { Webhook, WebhookInput } from "./webhook.js";

@Resolver(Webhook)
export class WebhookResolver {
  @Mutation(() => Webhook)
  async scrobble(
    @Arg("webhookInput") webhookInput: WebhookInput,
    @Ctx() ctx: Context
  ): Promise<Webhook> {
    const server = await ctx.prisma.server.findUnique({
      where: {
        secret: webhookInput.secret,
      },
      include: {
        users: true,
      },
    });

    if (!server) {
      return {
        success: false,
        reason: "Server not found",
      };
    }

    const user = server.users.find((user) => user.username === webhookInput.username);

    if (!user) {
      return {
        success: false,
        reason: "User not found",
      };
    }

    const accounts = await ctx.prisma.linkedAccount.findMany({
      where: {
        user: {
          id: user.id,
        },
      },
    });

    if (!accounts.length) {
      return {
        success: false,
        reason: "No linked providers",
      };
    }

    for (const account of accounts) {
      switch (account.provider) {
        case "ANILIST": {
          const anilist = new Anilist(account.accessToken);

          void anilist
            .setProgress(webhookInput.providerMediaId, webhookInput.episode)
            .then(async (status) => {
              void (await ctx.prisma.scrobble.create({
                data: {
                  episode: webhookInput.episode,
                  providerMediaId: webhookInput.providerMediaId.toString(),
                  status: {
                    create: {
                      provider: "ANILIST",
                      status,
                    },
                  },
                  server: {
                    connect: {
                      id: server.id,
                    },
                  },
                  user: {
                    connect: {
                      id: user.id,
                    },
                  },
                },
              }));
            });
          break;
        }
        case "KITSU": {
          // const kitsu = new
          break;
        }
      }
    }

    return {
      success: true,
      reason: "",
    };
  }
}
