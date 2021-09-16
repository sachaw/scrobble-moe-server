import "reflect-metadata";

import { Arg, Ctx, Mutation, Resolver } from "type-graphql";

import { Context } from "../context";
import { Anilist } from "../providers/anilist";
import { Webhook, WebhookInput } from "./webhook";

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

    const user = server.users.find((user) => user.plexId === webhookInput.plexId);

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
          const anilist = new Anilist(account.accountId, account.accessToken);
          void anilist.setProgress(webhookInput.providerMediaId, webhookInput.episode);
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
