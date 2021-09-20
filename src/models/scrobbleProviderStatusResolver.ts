import "reflect-metadata";

import { Ctx, FieldResolver, Resolver, Root } from "type-graphql";

import { NotFoundError } from "@frontendmonster/graphql-utils";
import { Scrobble } from "@prisma/client";

import { Context } from "../lib/context";
import { ScrobbleProviderStatus } from "./scrobbleProviderStatus";

@Resolver(ScrobbleProviderStatus)
export class ScrobbleProviderStatusResolver {
  @FieldResolver()
  async scrobble(
    @Root() scrobbleProviderStatus: ScrobbleProviderStatus,
    @Ctx() ctx: Context
  ): Promise<Scrobble> {
    const scrobble = await ctx.prisma.scrobbleProviderStatus
      .findUnique({
        where: {
          id: scrobbleProviderStatus.id,
        },
      })
      .scrobble();

    if (!scrobble) {
      throw new NotFoundError("Scrobble not found");
    }

    return scrobble;
  }
}
