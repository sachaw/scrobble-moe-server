import "reflect-metadata";

import { Authorized, Ctx, FieldResolver, Query, Resolver, Root } from "type-graphql";

import { Role, User } from "@prisma/client";

import { Context } from "../lib/context";
import { Authenticator } from "./authenticator";

@Resolver(Authenticator)
export class AuthenticatorResolver {
  constructor() {}

  @FieldResolver()
  async user(@Root() authenticator: Authenticator, @Ctx() ctx: Context): Promise<User> {
    return await ctx.prisma.authenticator
      .findUnique({
        where: {
          id: authenticator.id,
        },
      })
      .user();
  }

  @Authorized(Role.ADMIN)
  @Query((returns) => [Authenticator])
  async allAuthenticators(@Ctx() ctx: Context) {
    return await ctx.prisma.authenticator.findMany();
  }
}
