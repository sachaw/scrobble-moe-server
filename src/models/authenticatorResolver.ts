import "reflect-metadata";

import { Arg, Authorized, Ctx, Query, Resolver } from "type-graphql";

import { NotFoundError } from "@frontendmonster/graphql-utils";
import { Authenticator as PRISMA_Authenticator, Role } from "@prisma/client";

import { Context } from "../lib/context";
import { Authenticator, AuthenticatorFindManyInput } from "./authenticator";
import { restrictUser2 } from "./helperTypes";

@Resolver(Authenticator)
export class AuthenticatorResolver {
  @Authorized(Role.ADMIN, Role.USER)
  @Query(() => [Authenticator])
  async authenticators(
    @Arg("authenticatorFindManyInput") authenticatorFindManyInput: AuthenticatorFindManyInput,
    @Ctx() ctx: Context
  ): Promise<PRISMA_Authenticator[]> {
    if (!ctx.user) {
      throw new NotFoundError("User not found");
    }
    return await ctx.prisma.authenticator.findMany({
      ...restrictUser2(authenticatorFindManyInput, ctx.user.role, ctx.user.id),
      include: {
        user: true,
      },
    });
  }
}
