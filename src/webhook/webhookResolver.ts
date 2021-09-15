import "reflect-metadata";

import { Arg, Ctx, Field, InputType, Mutation, Resolver } from "type-graphql";

import { Context } from "../lib/context";
import { Anilist } from "../lib/providers/anilist";
import { Webhook } from "./webhook";

@InputType()
export class WebhookInput {
  @Field()
  secret: string;

  @Field()
  plexId: number;

  @Field()
  serverUUID: string;

  @Field()
  providerMediaId: number;

  @Field()
  episode: number;
}

@Resolver(Webhook)
export class WebhookResolver {
  @Mutation((returns) => Webhook)
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

    const user = server.users.find((user) => user.plexId !== webhookInput.plexId);

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
          const anilist = new Anilist(account.userId, account.accessToken);
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
      reason: "Unknown error",
    };
  }
}
