import "reflect-metadata";

import { AuthenticationError } from "apollo-server";
import { Arg, Authorized, Ctx, FieldResolver, Query, Resolver, Root } from "type-graphql";

import {
  Authenticator,
  LinkedAccount,
  Role,
  Scrobble,
  SeriesSubscription,
  Server,
  Token,
  TorrentClient,
  User as PRISMA_User,
} from "@prisma/client";

import { Context } from "../lib/context";
import { RequestScope } from "./helperTypes";
import { User, UserFindManyInput } from "./user";

@Resolver(User)
export class UserResolver {
  @FieldResolver()
  async authenticators(@Root() user: User, @Ctx() ctx: Context): Promise<Authenticator[]> {
    return await ctx.prisma.user
      .findUnique({
        where: {
          id: user.id,
        },
      })
      .authenticators();
  }

  @FieldResolver()
  async accounts(@Root() user: User, @Ctx() ctx: Context): Promise<LinkedAccount[]> {
    return await ctx.prisma.user
      .findUnique({
        where: {
          id: user.id,
        },
      })
      .accounts();
  }

  @FieldResolver()
  async tokens(@Root() user: User, @Ctx() ctx: Context): Promise<Token[]> {
    return await ctx.prisma.user
      .findUnique({
        where: {
          id: user.id,
        },
      })
      .tokens();
  }

  @FieldResolver()
  async scrobbles(@Root() user: User, @Ctx() ctx: Context): Promise<Scrobble[]> {
    return await ctx.prisma.user
      .findUnique({
        where: {
          id: user.id,
        },
      })
      .scrobbles();
  }

  @FieldResolver()
  async servers(@Root() user: User, @Ctx() ctx: Context): Promise<Server[]> {
    return await ctx.prisma.user
      .findUnique({
        where: {
          id: user.id,
        },
      })
      .servers();
  }

  @FieldResolver()
  async torrentClients(@Root() user: User, @Ctx() ctx: Context): Promise<TorrentClient[]> {
    return await ctx.prisma.user
      .findUnique({
        where: {
          id: user.id,
        },
      })
      .torrentClients();
  }

  @FieldResolver()
  async seriesSubscriptions(
    @Root() user: User,
    @Ctx() ctx: Context
  ): Promise<SeriesSubscription[]> {
    return await ctx.prisma.user
      .findUnique({
        where: {
          id: user.id,
        },
      })
      .seriesSubscriptions();
  }

  @Authorized(Role.ADMIN, Role.USER)
  @Query(() => [User])
  async users(
    @Arg("userFindManyInput") userFindManyInput: UserFindManyInput,
    @Ctx() ctx: Context
  ): Promise<PRISMA_User[]> {
    console.log("tmmp");

    if (!ctx.user) {
      throw new AuthenticationError("No user");
    }
    console.log("catch");

    const { requestScope, ...filter } = userFindManyInput;
    if (ctx.user.role === "USER" || requestScope === RequestScope.USER) {
      filter.where = {
        ...filter.where,
        id: {
          equals: ctx.user.id,
        },
      };
    }

    return await ctx.prisma.user.findMany(filter);
  }
}
