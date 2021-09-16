import "reflect-metadata";

import cuid from "cuid";
import { Arg, Authorized, Ctx, FieldResolver, Mutation, Query, Resolver, Root } from "type-graphql";

import { NotFoundError } from "@frontendmonster/graphql-utils";
import { Role, Scrobble, Server as PRISMA_Server, User } from "@prisma/client";

import { Context } from "../lib/context";
import { getPlexServers } from "../utils/plex";
import { LinkServerInput, Server, ServerResult } from "./server";

@Resolver(Server)
export class ServerResolver {
  @FieldResolver()
  async users(@Root() server: Server, @Ctx() ctx: Context): Promise<User[]> {
    return await ctx.prisma.server
      .findUnique({
        where: {
          id: server.id,
        },
      })
      .users();
  }

  @FieldResolver()
  async scrobbles(@Root() server: Server, @Ctx() ctx: Context): Promise<Scrobble[]> {
    return await ctx.prisma.server
      .findUnique({
        where: {
          id: server.id,
        },
      })
      .scrobbles();
  }

  @Authorized(Role.ADMIN)
  @Query(() => [Server])
  async allServers(@Ctx() ctx: Context): Promise<PRISMA_Server[]> {
    return await ctx.prisma.server.findMany();
  }

  @Authorized(Role.ADMIN, Role.USER)
  @Query(() => [ServerResult], { nullable: true })
  async getPlexAccountServers(@Ctx() ctx: Context): Promise<ServerResult[]> {
    const servers = await getPlexServers(ctx.user.plexAuthToken);

    const response: ServerResult[] = servers.map((server) => ({
      name: server._attributes.name,
      address: server._attributes.address,
      port: parseInt(server._attributes.port),
      version: server._attributes.version,
      scheme: server._attributes.scheme,
      host: server._attributes.host,
      localAddresses: server._attributes.localAddresses,
      machineIdentifier: server._attributes.machineIdentifier,
      createdAt: new Date(parseInt(server._attributes.createdAt)),
      updatedAt: new Date(parseInt(server._attributes.updatedAt)),
      owned: !!server._attributes.owned,
      synced: !!server._attributes.synced,
    }));

    return response;
  }

  @Authorized(Role.ADMIN, Role.USER)
  @Mutation(() => Server, { nullable: true })
  async linkServer(
    @Arg("linkServerInput") linkServerInput: LinkServerInput,
    @Ctx() ctx: Context
  ): Promise<PRISMA_Server> {
    const servers = await getPlexServers(ctx.user.plexAuthToken);

    const serverToLink = servers.find(
      (server) => server._attributes.machineIdentifier === linkServerInput.machineIdentifier
    );

    if (serverToLink) {
      return await ctx.prisma.server.upsert({
        where: {
          uuid: serverToLink._attributes.machineIdentifier,
        },
        update: {
          name: serverToLink._attributes.name,
        },

        create: {
          secret: cuid(),
          uuid: serverToLink._attributes.machineIdentifier,
          name: serverToLink._attributes.name,
          users: {
            connect: {
              id: ctx.user.id,
            },
          },
        },
      });
    }

    throw new NotFoundError("machineIdentifier");
  }
}
