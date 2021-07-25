import "reflect-metadata";

import {
  Arg,
  Authorized,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Query,
  Resolver,
  Root,
} from "type-graphql";

import {
  Authenticator,
  LinkedAccount,
  Role,
  Scrobble,
  SeriesSubscription,
  Server,
  Session,
  Token,
  TorrentClient,
} from "@prisma/client";

import { Context } from "../lib/context";
import { User } from "./user";

@InputType()
class UserUniqueInput {
  @Field({ nullable: true })
  id: string;
}

@Resolver(User)
export class UserResolver {
  constructor() {}

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
  async sessions(@Root() user: User, @Ctx() ctx: Context): Promise<Session[]> {
    return await ctx.prisma.user
      .findUnique({
        where: {
          id: user.id,
        },
      })
      .sessions();
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
  @Query((returns) => [User])
  async allUsers(@Ctx() ctx: Context) {
    return await ctx.prisma.user.findMany();
  }

  @Authorized(Role.ADMIN, Role.USER)
  @Query((returns) => User, { nullable: true })
  async user(@Arg("userUniqueInput") userUniqueInput: UserUniqueInput, @Ctx() ctx: Context) {
    if (ctx.user.role && ctx.user.role === Role.ADMIN) {
      return await ctx.prisma.user.findUnique({
        where: {
          id: userUniqueInput.id ? userUniqueInput.id : ctx.user.id,
        },
      });
    } else {
      return await ctx.prisma.user.findUnique({
        where: {
          id: ctx.user.id,
        },
      });
    }
  }
}
