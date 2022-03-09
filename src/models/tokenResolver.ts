import "reflect-metadata";

import { Arg, Authorized, Ctx, Query, Resolver } from "type-graphql";
import { Service } from "typedi";

import { NotFoundError } from "@frontendmonster/graphql-utils";
import pkg, { Token as PRISMA_Token } from "@prisma/client";

import { Context } from "../lib/context.js";
import { restrictUser } from "./helperTypes.js";
import { Token, TokenFindManyInput } from "./token.js";

const { Role } = pkg;

@Service()
@Resolver(Token)
export class TokenResolver {
  @Authorized(Role.ADMIN, Role.USER)
  @Query(() => [Token])
  async tokens(
    @Arg("tokenFindManyInput") tokenFindManyInput: TokenFindManyInput,
    @Ctx() ctx: Context
  ): Promise<PRISMA_Token[]> {
    if (!ctx.user) {
      throw new NotFoundError("User not found");
    }
    return await ctx.prisma.token.findMany({
      ...restrictUser(tokenFindManyInput, ctx.user.role, ctx.user.id),
      include: {
        user: true,
      },
    });
  }
}
