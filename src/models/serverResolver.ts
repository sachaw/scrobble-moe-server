import "reflect-metadata";

import {
  Arg,
  Authorized,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Mutation,
  Query,
  Resolver,
  Root,
} from "type-graphql";

import { NotFoundError } from "@frontendmonster/graphql-utils";
import { Role, Scrobble, User } from "@prisma/client";

import { Context } from "../lib/context";
import { getPlexServers } from "../utils/plex";
import { Server, ServerResult } from "./server";

@InputType()
class AddServerInput {
  @Field()
  machineIdentifier: string;
}

@Resolver(Server)
export class ServerResolver {
  constructor() {}

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
  @Query((returns) => [Server])
  async allServers(@Ctx() ctx: Context) {
    return await ctx.prisma.server.findMany();
  }

  @Authorized(Role.ADMIN, Role.USER)
  @Query((returns) => [ServerResult], { nullable: true })
  async getPlexAccoundServers(@Ctx() ctx: Context) {
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
  @Mutation((returns) => Server, { nullable: true })
  async addServer(@Arg("addServerInput") addServerInput: AddServerInput, @Ctx() ctx: Context) {
    const servers = await getPlexServers(ctx.user.plexAuthToken);

    const serverToAdd = servers.find(
      (server) => server._attributes.machineIdentifier === addServerInput.machineIdentifier
    );

    if (serverToAdd) {
      return await ctx.prisma.server.upsert({
        where: {
          uuid: serverToAdd._attributes.machineIdentifier,
        },
        update: {
          name: serverToAdd._attributes.name,
        },

        create: {
          secret: "abc",
          uuid: serverToAdd._attributes.machineIdentifier,
          name: serverToAdd._attributes.name,
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
