import "reflect-metadata";

import { Arg, Authorized, Ctx, FieldResolver, Query, Resolver, Root } from "type-graphql";

import { NotFoundError } from "@frontendmonster/graphql-utils";
import { Role, Token as PRISMA_Token, User } from "@prisma/client";

import { Context } from "../lib/context";
import { restrictUser } from "./helperTypes";
import { Token, TokenFindManyInput } from "./token";

@Resolver(Token)
export class TokenResolver {
  @FieldResolver()
  async user(@Root() token: Token, @Ctx() ctx: Context): Promise<User> {
    const user = await ctx.prisma.token
      .findUnique({
        where: {
          id: token.id,
        },
      })
      .user();

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return user;
  }

  @Authorized(Role.ADMIN, Role.USER)
  @Query(() => [Token])
  async tokens(
    @Arg("tokenFindManyInput") tokenFindManyInput: TokenFindManyInput,
    @Ctx() ctx: Context
  ): Promise<PRISMA_Token[]> {
    if (!ctx.user) {
      throw new NotFoundError("User not found");
    }
    return await ctx.prisma.token.findMany(
      restrictUser(tokenFindManyInput, ctx.user.role, ctx.user.id)
    );
  }
}
