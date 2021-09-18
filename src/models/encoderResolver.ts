import "reflect-metadata";

import { Arg, Authorized, Ctx, FieldResolver, Query, Resolver, Root } from "type-graphql";

import { Encoder as PRISMA_Encoder, Role, SeriesSubscription } from "@prisma/client";

import { Context } from "../lib/context";
import { Encoder, EncoderFindManyInput } from "./encoder";

@Resolver(Encoder)
export class EncoderResolver {
  @FieldResolver()
  async userSubscriptions(
    @Root() encoder: Encoder,
    @Ctx() ctx: Context
  ): Promise<SeriesSubscription[]> {
    return await ctx.prisma.encoder
      .findUnique({
        where: {
          id: encoder.id,
        },
      })
      .userSubscriptions();
  }

  @Authorized(Role.ADMIN, Role.USER)
  @Query(() => [Encoder])
  async encoders(
    @Arg("encoderFindManyInput") encoderFindManyInput: EncoderFindManyInput,
    @Ctx() ctx: Context
  ): Promise<PRISMA_Encoder[]> {
    return await ctx.prisma.encoder.findMany(encoderFindManyInput);
  }
}
