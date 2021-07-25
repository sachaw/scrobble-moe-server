import "reflect-metadata";

import { Authorized, Ctx, FieldResolver, Query, Resolver, Root } from "type-graphql";

import { LinkedAccount, Role, Server, User } from "@prisma/client";

import { Context } from "../lib/context";
import { Scrobble } from "./scrobble";

@Resolver(Scrobble)
export class ScrobbleResolver {
  constructor() {}

  @FieldResolver()
  async user(@Root() scrobble: Scrobble, @Ctx() ctx: Context): Promise<User> {
    return await ctx.prisma.scrobble
      .findUnique({
        where: {
          id: scrobble.id,
        },
      })
      .user();
  }

  @FieldResolver()
  async server(@Root() scrobble: Scrobble, @Ctx() ctx: Context): Promise<Server> {
    return await ctx.prisma.scrobble
      .findUnique({
        where: {
          id: scrobble.id,
        },
      })
      .server();
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

  @Authorized(Role.ADMIN)
  @Query((returns) => [Scrobble])
  async allScrobles(@Ctx() ctx: Context) {
    return await ctx.prisma.scrobble.findMany();
  }
}
