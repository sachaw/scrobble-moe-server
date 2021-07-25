import "reflect-metadata";

import { Authorized, Ctx, FieldResolver, Query, Resolver, Root } from "type-graphql";

import { Encoder, Role, User } from "@prisma/client";

import { Context } from "../lib/context";
import { SeriesSubscription } from "./seriesSubscription";

@Resolver(SeriesSubscription)
export class SeriesSubscriptionResolver {
  constructor() {}

  @FieldResolver()
  async user(@Root() seriesSubscription: SeriesSubscription, @Ctx() ctx: Context): Promise<User> {
    return await ctx.prisma.seriesSubscription
      .findUnique({
        where: {
          id: seriesSubscription.id,
        },
      })
      .user();
  }

  @FieldResolver()
  async encoder(
    @Root() seriesSubscription: SeriesSubscription,
    @Ctx() ctx: Context
  ): Promise<Encoder> {
    return await ctx.prisma.seriesSubscription
      .findUnique({
        where: {
          id: seriesSubscription.id,
        },
      })
      .encoder();
  }

  @Authorized(Role.ADMIN)
  @Query((returns) => [SeriesSubscription])
  async allSeriesSubscriptions(@Ctx() ctx: Context) {
    return await ctx.prisma.seriesSubscription.findMany();
  }
}
