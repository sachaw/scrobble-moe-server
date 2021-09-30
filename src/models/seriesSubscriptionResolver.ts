import "reflect-metadata";

import { Arg, Authorized, Ctx, Query, Resolver } from "type-graphql";

import { NotFoundError } from "@frontendmonster/graphql-utils";
import { Role, SeriesSubscription as PRISMA_SeriesSubscription } from "@prisma/client";

import { Context } from "../lib/context";
import { restrictUser } from "./helperTypes";
import { SeriesSubscription, SeriesSubscriptionFindManyInput } from "./seriesSubscription";

@Resolver(SeriesSubscription)
export class SeriesSubscriptionResolver {
  @Authorized(Role.ADMIN, Role.USER)
  @Query(() => [SeriesSubscription])
  async seriesSubscriptions(
    @Arg("seriesSubscriptionFindManyInput")
    seriesSubscriptionFindManyInput: SeriesSubscriptionFindManyInput,
    @Ctx() ctx: Context
  ): Promise<PRISMA_SeriesSubscription[]> {
    if (!ctx.user) {
      throw new NotFoundError("User not found");
    }
    return await ctx.prisma.seriesSubscription.findMany({
      ...restrictUser(seriesSubscriptionFindManyInput, ctx.user.role, ctx.user.id),
      include: {
        user: true,
        encoder: true,
      },
    });
  }
}
