import "reflect-metadata";

import { Arg, Authorized, Ctx, Query, Resolver } from "type-graphql";

import pkg, { Encoder as PRISMA_Encoder } from "@prisma/client";

import { Context } from "../lib/context.js";
import { Encoder, EncoderFindManyInput } from "./encoder.js";

const { Role } = pkg;
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
