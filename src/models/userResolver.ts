import "reflect-metadata";

import { Arg, Authorized, Ctx, FieldResolver, Query, Resolver, Root } from "type-graphql";

import { NotFoundError } from "@frontendmonster/graphql-utils";
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
import { User, UserUniqueInput } from "./user";

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

  @Authorized(Role.ADMIN)
  @Query(() => [User])
  async allUsers(@Ctx() ctx: Context): Promise<PRISMA_User[]> {
    return await ctx.prisma.user.findMany();
  }

  @Authorized(Role.ADMIN, Role.USER)
  @Query(() => User, { nullable: true })
  async user(
    @Arg("userUniqueInput") userUniqueInput: UserUniqueInput,
    @Ctx() ctx: Context
  ): Promise<PRISMA_User> {
    let user: PRISMA_User | null;
    if (ctx.user.role && ctx.user.role === Role.ADMIN) {
      user = await ctx.prisma.user.findUnique({
        where: {
          id: userUniqueInput.id ? userUniqueInput.id : ctx.user.id,
        },
      });
    } else {
      user = await ctx.prisma.user.findUnique({
        where: {
          id: ctx.user.id,
        },
      });
    }

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return user;
  }
}
