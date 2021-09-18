import "reflect-metadata";

import { Arg, Authorized, Ctx, FieldResolver, Query, Resolver, Root } from "type-graphql";

import { NotFoundError } from "@frontendmonster/graphql-utils";
import { Authenticator as PRISMA_Authenticator, Role, User } from "@prisma/client";

import { Context } from "../lib/context";
import { Authenticator, AuthenticatorFindManyInput } from "./authenticator";
import { restrictUser } from "./helperTypes";

@Resolver(Authenticator)
export class AuthenticatorResolver {
  @FieldResolver()
  async user(@Root() authenticator: Authenticator, @Ctx() ctx: Context): Promise<User> {
    const user = await ctx.prisma.authenticator
      .findUnique({
        where: {
          id: authenticator.id,
        },
      })
      .user();

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return user;
  }

  @Authorized(Role.ADMIN, Role.USER)
  @Query(() => [Authenticator])
  async authenticators(
    @Arg("authenticatorFindManyInput") authenticatorFindManyInput: AuthenticatorFindManyInput,
    @Ctx() ctx: Context
  ): Promise<PRISMA_Authenticator[]> {
    return await ctx.prisma.authenticator.findMany(
      restrictUser(authenticatorFindManyInput, ctx.user.role, ctx.user.id)
    );
  }
}
