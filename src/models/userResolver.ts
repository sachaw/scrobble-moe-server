import "reflect-metadata";

import { Arg, Authorized, Ctx, Query, Resolver } from "type-graphql";

import { AuthenticationError } from "@frontendmonster/graphql-utils";
import { Role, User as PRISMA_User } from "@prisma/client";

import { Context } from "../lib/context";
import { RequestScope } from "./helperTypes";
import { User, UserFindManyInput } from "./user";

@Resolver(User)
export class UserResolver {
  @Authorized(Role.ADMIN, Role.USER)
  @Query(() => [User])
  async users(
    @Arg("userFindManyInput") userFindManyInput: UserFindManyInput,
    @Ctx() ctx: Context
  ): Promise<PRISMA_User[]> {
    if (!ctx.user) {
      throw new AuthenticationError("No user");
    }

    const { requestScope, ...filter } = userFindManyInput;
    if (ctx.user.role === "USER" || requestScope === RequestScope.USER) {
      filter.where = {
        ...filter.where,
        id: {
          equals: ctx.user.id,
        },
      };
    }

    return await ctx.prisma.user.findMany({
      ...filter,
      include: {
        authenticators: true,
        accounts: true,
        tokens: true,
        scrobbles: {
          include: {
            accounts: true,
          },
        },
        servers: true,
        torrentClients: true,
        seriesSubscriptions: true,
      },
    });
  }
}
