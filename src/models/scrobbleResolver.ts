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

import { LinkedAccount, Role, Server, User } from "@prisma/client";

import { Context } from "../";
import { Scrobble } from "./scrobble";

@InputType()
class ScrobbleUniqueInput {
  @Field({ nullable: true, description: "ID of user who's scrobbles are to be fetched." })
  id: string;
}

@Resolver(Scrobble)
export class ScrobbleResolver {
  constructor() {}

  @FieldResolver()
  async user(@Root() scrobble: Scrobble, @Ctx() ctx: Context): Promise<User> {
    return ctx.prisma.scrobble
      .findUnique({
        where: {
          id: scrobble.id,
        },
      })
      .user();
  }

  @FieldResolver()
  async server(@Root() scrobble: Scrobble, @Ctx() ctx: Context): Promise<Server> {
    return ctx.prisma.scrobble
      .findUnique({
        where: {
          id: scrobble.id,
        },
      })
      .server();
  }

  @FieldResolver()
  async accounts(@Root() scrobble: Scrobble, @Ctx() ctx: Context): Promise<LinkedAccount[]> {
    return ctx.prisma.scrobble
      .findUnique({
        where: {
          id: scrobble.id,
        },
      })
      .accounts();
  }

  @Authorized(Role.ADMIN, Role.USER)
  @Query((returns) => Scrobble, { nullable: true })
  async allScrobbles(
    @Arg("scrobbleUniqueInput") scrobbleUniqueInput: ScrobbleUniqueInput,
    @Ctx() ctx: Context
  ) {
    if (ctx.user.role && ctx.user.role === Role.ADMIN) {
      return ctx.prisma.scrobble.findMany({
        where: {
          user: {
            id: scrobbleUniqueInput.id ? scrobbleUniqueInput.id : ctx.user.id,
          },
        },
      });
    } else {
      return ctx.prisma.scrobble.findMany({
        where: {
          user: {
            id: ctx.user.id,
          },
        },
      });
    }
  }
}
