import "reflect-metadata";

import { Arg, Authorized, Ctx, Query, Resolver } from "type-graphql";

import { NotFoundError } from "@frontendmonster/graphql-utils";
import pkg, { Authenticator as PRISMA_Authenticator } from "@prisma/client";

import { Context } from "../lib/context.js";
import { Authenticator, AuthenticatorFindManyInput } from "./authenticator.js";
import { restrictUser } from "./helperTypes.js";

const { Role } = pkg;
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
      ...restrictUser(authenticatorFindManyInput, ctx.user.role, ctx.user.id),
      include: {
        user: true,
      },
    });
  }
}
