import "reflect-metadata";

import { Authorized, Ctx, FieldResolver, Query, Resolver, Root } from "type-graphql";

import { Role, User } from "@prisma/client";

import { Context } from "../lib/context";
import { TorrentClient } from "./torrentClient";

@Resolver(TorrentClient)
export class TorrentClientResolver {
  constructor() {}

  @FieldResolver()
  async user(@Root() torrentClient: TorrentClient, @Ctx() ctx: Context): Promise<User> {
    return await ctx.prisma.torrentClient
      .findUnique({
        where: {
          id: torrentClient.id,
        },
      })
      .user();
  }

  @Authorized(Role.ADMIN)
  @Query((returns) => [TorrentClient])
  async allTorrentClients(@Ctx() ctx: Context) {
    return await ctx.prisma.torrentClient.findMany();
  }
}
