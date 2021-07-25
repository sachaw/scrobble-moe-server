import "reflect-metadata";

import { Authorized, Ctx, FieldResolver, Query, Resolver, Root } from "type-graphql";

import { Role, SeriesSubscription } from "@prisma/client";

import { Context } from "../lib/context";
import { Encoder } from "./encoder";

@Resolver(Encoder)
export class EncoderResolver {
  constructor() {}

  @FieldResolver()
  async userSubscriptions(
    @Root() encoder: Encoder,
    @Ctx() ctx: Context
  ): Promise<SeriesSubscription[]> {
    return await ctx.prisma.encoder
      .findUnique({
        where: {
          id: encoder.id,
        },
      })
      .userSubscriptions();
  }

  @Authorized(Role.ADMIN)
  @Query((returns) => [Encoder])
  async allEncoders(@Ctx() ctx: Context) {
    return await ctx.prisma.encoder.findMany();
  }
}
