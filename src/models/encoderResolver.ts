import "reflect-metadata";

import { Arg, Authorized, Ctx, Query, Resolver } from "type-graphql";

import { Encoder as PRISMA_Encoder, Role } from "@prisma/client";

import { Context } from "../lib/context";
import { Encoder, EncoderFindManyInput } from "./encoder";

@Resolver(Encoder)
export class EncoderResolver {
  @Authorized(Role.ADMIN, Role.USER)
  @Query(() => [Encoder])
  async encoders(
    @Arg("encoderFindManyInput") encoderFindManyInput: EncoderFindManyInput,
    @Ctx() ctx: Context
  ): Promise<PRISMA_Encoder[]> {
    return await ctx.prisma.encoder.findMany({
      ...encoderFindManyInput,
      include: {
        userSubscriptions: true,
      },
    });
  }
}
