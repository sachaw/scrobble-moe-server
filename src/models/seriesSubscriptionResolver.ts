import "reflect-metadata";

import { Arg, Authorized, Ctx, FieldResolver, Query, Resolver, Root } from "type-graphql";

import { NotFoundError } from "@frontendmonster/graphql-utils";
import {
  Encoder,
  Role,
  SeriesSubscription as PRISMA_SeriesSubscription,
  User,
} from "@prisma/client";

import { Context } from "../lib/context";
import { restrictUser } from "./helperTypes";
import { SeriesSubscription, SeriesSubscriptionFindManyInput } from "./seriesSubscription";

@Resolver(SeriesSubscription)
export class SeriesSubscriptionResolver {
  @FieldResolver()
  async user(@Root() seriesSubscription: SeriesSubscription, @Ctx() ctx: Context): Promise<User> {
    const user = await ctx.prisma.seriesSubscription
      .findUnique({
        where: {
          id: seriesSubscription.id,
        },
      })
      .user();

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return user;
  }

  @FieldResolver()
  async encoder(
    @Root() seriesSubscription: SeriesSubscription,
    @Ctx() ctx: Context
  ): Promise<Encoder> {
    const encoder = await ctx.prisma.seriesSubscription
      .findUnique({
        where: {
          id: seriesSubscription.id,
        },
      })
      .encoder();

    if (!encoder) {
      throw new NotFoundError("Encoder not found");
    }

    return encoder;
  }

  @Authorized(Role.ADMIN, Role.USER)
  @Query(() => [SeriesSubscription])
  async seriesSubscriptions(
    @Arg("seriesSubscriptionFindManyInput")
    seriesSubscriptionFindManyInput: SeriesSubscriptionFindManyInput,
    @Ctx() ctx: Context
  ): Promise<PRISMA_SeriesSubscription[]> {
    return await ctx.prisma.seriesSubscription.findMany(
      restrictUser(seriesSubscriptionFindManyInput, ctx.user.role, ctx.user.id)
    );
  }
}
