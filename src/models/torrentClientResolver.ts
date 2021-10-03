import "reflect-metadata";

import { Arg, Authorized, Ctx, Query, Resolver } from "type-graphql";

import { NotFoundError } from "@frontendmonster/graphql-utils";
import pkg, { TorrentClient as PRISMA_TorrentClient } from "@prisma/client";

import { Context } from "../lib/context.js";
import { restrictUser } from "./helperTypes.js";
import { TorrentClient, TorrentClientFindManyInput } from "./torrentClient.js";

const { Role } = pkg;
@Resolver(TorrentClient)
export class TorrentClientResolver {
  @Authorized(Role.ADMIN, Role.USER)
  @Query(() => [TorrentClient])
  async torrentClients(
    @Arg("torrentClientFindManyInput") torrentClientFindManyInput: TorrentClientFindManyInput,
    @Ctx() ctx: Context
  ): Promise<PRISMA_TorrentClient[]> {
    if (!ctx.user) {
      throw new NotFoundError("User not found");
    }
    return await ctx.prisma.torrentClient.findMany({
      ...restrictUser(torrentClientFindManyInput, ctx.user.role, ctx.user.id),
      include: { user: true },
    });
  }
}
