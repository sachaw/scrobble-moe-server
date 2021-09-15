import "reflect-metadata";

import { Authorized, Ctx, FieldResolver, Query, Resolver, Root } from "type-graphql";

import { NotFoundError } from "@frontendmonster/graphql-utils";
import { Role, TorrentClient as PRISMA_TorrentClient, User } from "@prisma/client";

import { Context } from "../lib/context";
import { TorrentClient } from "./torrentClient";

@Resolver(TorrentClient)
export class TorrentClientResolver {
  @FieldResolver()
  async user(@Root() torrentClient: TorrentClient, @Ctx() ctx: Context): Promise<User> {
    const user = await ctx.prisma.torrentClient
      .findUnique({
        where: {
          id: torrentClient.id,
        },
      })
      .user();

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return user;
  }

  @Authorized(Role.ADMIN)
  @Query(() => [TorrentClient])
  async allTorrentClients(@Ctx() ctx: Context): Promise<PRISMA_TorrentClient[]> {
    return await ctx.prisma.torrentClient.findMany();
  }
}
