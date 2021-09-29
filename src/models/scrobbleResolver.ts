import "reflect-metadata";

import { Arg, Authorized, Ctx, FieldResolver, Query, Resolver, Root } from "type-graphql";

import { NotFoundError } from "@frontendmonster/graphql-utils";
import {
  LinkedAccount,
  Role,
  Scrobble as PRISMA_Scrobble,
  ScrobbleProviderStatus,
  Server,
  User,
} from "@prisma/client";

import { Context } from "../lib/context";
import { Anilist } from "../lib/providers/anilist";
import { restrictUser } from "./helperTypes";
import { Scrobble, ScrobbleFeed, ScrobbleFindManyInput } from "./scrobble";

@Resolver(Scrobble)
export class ScrobbleResolver {
  @FieldResolver()
  async user(@Root() scrobble: Scrobble, @Ctx() ctx: Context): Promise<User> {
    const user = await ctx.prisma.scrobble
      .findUnique({
        where: {
          id: scrobble.id,
        },
      })
      .user();

    if (!user) {
      throw new NotFoundError("User not found");
    }
    return user;
  }

  @FieldResolver()
  async server(@Root() scrobble: Scrobble, @Ctx() ctx: Context): Promise<Server> {
    const server = await ctx.prisma.scrobble
      .findUnique({
        where: {
          id: scrobble.id,
        },
      })
      .server();

    if (!server) {
      throw new NotFoundError("Server not found");
    }
    return server;
  }

  @FieldResolver()
  async accounts(@Root() scrobble: Scrobble, @Ctx() ctx: Context): Promise<LinkedAccount[]> {
    return await ctx.prisma.scrobble
      .findUnique({
        where: {
          id: scrobble.id,
        },
      })
      .accounts();
  }

  @FieldResolver()
  async status(@Root() scrobble: Scrobble, @Ctx() ctx: Context): Promise<ScrobbleProviderStatus[]> {
    return await ctx.prisma.scrobble
      .findUnique({
        where: {
          id: scrobble.id,
        },
      })
      .status();
  }

  @Authorized(Role.ADMIN, Role.USER)
  @Query(() => [Scrobble])
  async scrobbles(
    @Arg("scrobbleFindManyInput") scrobbleFindManyInput: ScrobbleFindManyInput,
    @Ctx() ctx: Context
  ): Promise<PRISMA_Scrobble[]> {
    if (!ctx.user) {
      throw new NotFoundError("User not found");
    }
    return await ctx.prisma.scrobble.findMany(
      restrictUser(scrobbleFindManyInput, ctx.user.role, ctx.user.id)
    );
  }

  @Query(() => [ScrobbleFeed])
  async latestScrobbles(@Ctx() ctx: Context): Promise<ScrobbleFeed[]> {
    const scrobbles = await ctx.prisma.scrobble.findMany({
      take: 50,
    });

    const scrobbleFeed: Omit<ScrobbleFeed & { userId: string }, "anilistData" | "user">[] = [];

    const searchScrobbleFeed = (providerMediaId: string) => {
      return scrobbleFeed.findIndex(
        (scrobbleFeed) => scrobbleFeed.providerMediaId === providerMediaId
      );
    };

    scrobbles.map(async (scrobble) => {
      const index = searchScrobbleFeed(scrobble.providerMediaId);

      if (index === -1) {
        scrobbleFeed.push({
          providerMediaId: scrobble.providerMediaId,
          startEpisode: scrobble.episode,
          endEpisode: scrobble.episode,
          userId: scrobble.userId,
        });
      } else {
        if (scrobble.episode > scrobbleFeed[index].endEpisode) {
          scrobbleFeed[index].endEpisode = scrobble.episode;
        }
        if (scrobble.episode < scrobbleFeed[index].startEpisode) {
          scrobbleFeed[index].startEpisode = scrobble.episode;
        }
      }
    });

    const anilist = new Anilist();

    const ids: number[] = scrobbleFeed.map((scrobbleFeed) =>
      parseInt(scrobbleFeed.providerMediaId)
    );
    const anilistData = await anilist.getAnimeInfo(ids);
    return Promise.all(
      scrobbleFeed.map(async (feedItem) => {
        const { userId, ...entry } = feedItem;
        const user = await ctx.prisma.user.findUnique({
          where: {
            id: userId,
          },
        });

        if (!user) {
          throw new NotFoundError("User not found");
        }

        return {
          ...entry,
          anilistData: anilistData.find((entry) => entry.id === parseInt(feedItem.providerMediaId)),
          user: {
            username: user.username,
            thumb: user.thumb,
          },
        };
      })
    );
  }
}
