import "reflect-metadata";

import { Arg, Authorized, Ctx, FieldResolver, Query, Resolver, Root } from "type-graphql";

import { NotFoundError } from "@frontendmonster/graphql-utils";
import { Role, TorrentClient as PRISMA_TorrentClient, User } from "@prisma/client";

import { Context } from "../lib/context";
import { restrictUser } from "./helperTypes";
import { TorrentClient, TorrentClientFindManyInput } from "./torrentClient";

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

  @Authorized(Role.ADMIN, Role.USER)
  @Query(() => [TorrentClient])
  async torrentClients(
    @Arg("torrentClientFindManyInput") torrentClientFindManyInput: TorrentClientFindManyInput,
    @Ctx() ctx: Context
  ): Promise<PRISMA_TorrentClient[]> {
    if (!ctx.user) {
      throw new NotFoundError("User not found");
    }
    return await ctx.prisma.torrentClient.findMany(
      restrictUser(torrentClientFindManyInput, ctx.user.role, ctx.user.id)
    );
  }
}
