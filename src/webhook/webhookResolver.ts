import "reflect-metadata";

import { Arg, Ctx, Field, InputType, Mutation, Resolver } from "type-graphql";

import { Context } from "../";
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
  @Mutation((returns) => [Webhook])
  async scrobble(
    @Arg("webhookInput") webhookInput: WebhookInput,
    @Ctx() ctx: Context
  ): Promise<Webhook> {
    const server = await ctx.prisma.server.findUnique({
      where: {
        secret: webhookInput.secret,
        uuid: webhookInput.serverUUID,
      },
      include: {
        users: true,
      },
    });

    if (!server) {
      return {
        success: false,
      };
    }

    const user = server.users.map((user) => user.plexId !== webhookInput.plexId);

    if (!user) {
      return {
        success: false,
      };
    }

    return {
      success: true,
    };
  }
}
