import "reflect-metadata";

import { Arg, Authorized, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { Service } from "typedi";

import { NotFoundError } from "@frontendmonster/graphql-utils";
import pkg, { Encoder as PRISMA_Encoder } from "@prisma/client";

import { Context } from "../lib/context.js";
import { redis } from "../lib/redis.js";
import {
  AddEncoderInput,
  Encoder,
  EncoderFeedInput,
  EncoderFindManyInput,
  RssItem,
} from "./encoder.js";

const { Role } = pkg;

@Service()
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

  // @Authorized(Role.ADMIN, Role.USER)
  @Query(() => [RssItem])
  async encoderFeed(
    @Arg("encoderFeedInput") encoderFeedInput: EncoderFeedInput,
    @Ctx() ctx: Context
  ): Promise<RssItem[]> {
    const encoder = await ctx.prisma.encoder.findUnique({
      where: {
        id: encoderFeedInput.id,
      },
    });

    if (!encoder) {
      throw new NotFoundError("Encoder not found");
    }
    const feed = await redis.get(encoder.rssURL);

    if (!feed) {
      throw new NotFoundError("Feed not cached");
    }

    return JSON.parse(feed) as RssItem[];
  }

  @Authorized(Role.ADMIN, Role.USER)
  @Mutation(() => Encoder)
  async addEncoder(
    @Arg("addEncoderInput") addEncoderInput: AddEncoderInput,
    @Ctx() ctx: Context
  ): Promise<PRISMA_Encoder> {
    return await ctx.prisma.encoder.create({
      data: {
        name: addEncoderInput.name,
        rssURL: addEncoderInput.rssURL,
        matchRegex: addEncoderInput.matchRegex,
      },
    });
  }
}
