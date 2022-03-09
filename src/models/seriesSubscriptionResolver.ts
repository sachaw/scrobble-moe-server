import "reflect-metadata";

import { Arg, Authorized, Ctx, FieldResolver, Mutation, Query, Resolver, Root } from "type-graphql";
import { Service } from "typedi";

import { NotFoundError } from "@frontendmonster/graphql-utils";
import pkg, { SeriesSubscription as PRISMA_SeriesSubscription } from "@prisma/client";

import { Context } from "../lib/context.js";
import { Anilist } from "../lib/providers/anilist.js";
import { restrictUser } from "./helperTypes.js";
import { AniListData } from "./scrobble.js";
import {
  AddSeriesSubscriptionInput,
  SeriesSubscription,
  SeriesSubscriptionFindManyInput,
} from "./seriesSubscription.js";

const { Role } = pkg;

@Service()
@Resolver(SeriesSubscription)
export class SeriesSubscriptionResolver {
  @FieldResolver()
  async anilist(@Root() seriesSubscription: SeriesSubscription): Promise<AniListData> {
    const anilist = new Anilist();
    const data = await anilist.getAnimeInfo([parseInt(seriesSubscription.providerMediaId)]);
    return data[0];
  }

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

  @Authorized(Role.ADMIN, Role.USER)
  @Mutation(() => SeriesSubscription)
  async addSeriesSubscription(
    @Arg("addSeriesSubscriptionInput") addSeriesSubscriptionInput: AddSeriesSubscriptionInput,
    @Ctx() ctx: Context
  ): Promise<PRISMA_SeriesSubscription> {
    if (!ctx.user) {
      throw new NotFoundError("User not found");
    }

    return await ctx.prisma.seriesSubscription.create({
      data: {
        nameIncludes: addSeriesSubscriptionInput.nameIncludes,
        nameExcludes: addSeriesSubscriptionInput.nameExcludes ?? "",
        episodeOffset: addSeriesSubscriptionInput.episodeOffset,
        providerMediaId: addSeriesSubscriptionInput.providerMediaId,
        encoder: {
          connect: {
            id: addSeriesSubscriptionInput.encoderId,
          },
        },
        user: {
          connect: {
            id: ctx.user.id,
          },
        },
      },
    });
  }
}
