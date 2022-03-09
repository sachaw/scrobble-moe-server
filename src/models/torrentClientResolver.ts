import "reflect-metadata";

import { Arg, Authorized, Ctx, FieldResolver, Mutation, Query, Resolver, Root } from "type-graphql";
import { Service } from "typedi";

import type { Torrent as TorrentEntry } from "@ctrl/qbittorrent/dist/types";
import { NotFoundError } from "@frontendmonster/graphql-utils";
import pkg, { TorrentClient as PRISMA_TorrentClient } from "@prisma/client";

import { Context } from "../lib/context.js";
import { TorrentManager } from "../lib/TorrentClientManager.js";
import { restrictUser } from "./helperTypes.js";
import {
  AddTorrentClientInput,
  TorrentClient,
  TorrentClientFindManyInput,
} from "./torrentClient.js";

const { Role } = pkg;

@Service()
@Resolver(TorrentClient)
export class TorrentClientResolver {
  constructor(private readonly torrentManagerService: TorrentManager) {}

  @FieldResolver()
  async reachable(@Root() torrentClient: TorrentClient): Promise<boolean> {
    this.torrentManagerService.setConnection({
      baseUrl: torrentClient.clientUrl,
      username: torrentClient.clientUsername,
      password: torrentClient.clientPassword,
    });

    return await this.torrentManagerService.checkConnectivity();
  }

  @FieldResolver()
  async torrents(@Root() torrentClient: TorrentClient): Promise<TorrentEntry[]> {
    this.torrentManagerService.setConnection({
      baseUrl: torrentClient.clientUrl,
      username: torrentClient.clientUsername,
      password: torrentClient.clientPassword,
    });

    return await this.torrentManagerService.getManagedTorrents();
  }

  @Authorized(Role.ADMIN)
  @Query(() => [TorrentClient])
  async torrentClients(
    @Arg("torrentClientFindManyInput") torrentClientFindManyInput: TorrentClientFindManyInput,
    @Ctx() ctx: Context
  ): Promise<PRISMA_TorrentClient[]> {
    if (!ctx.user) {
      throw new NotFoundError("User not found");
    }
    return await ctx.prisma.torrentClient.findMany({
      ...restrictUser(torrentClientFindManyInput, ctx.user.role, ctx.user.id),
      include: { user: true },
    });
  }

  @Authorized(Role.ADMIN, Role.USER)
  @Query(() => TorrentClient)
  async torrentClient(@Ctx() ctx: Context): Promise<PRISMA_TorrentClient> {
    if (!ctx.user) {
      throw new NotFoundError("User not found");
    }

    const torrentClient = await ctx.prisma.torrentClient.findUnique({
      where: {
        userId: ctx.user.id,
      },
    });

    if (!torrentClient) {
      throw new NotFoundError("Torrent Client");
    }

    return torrentClient;
  }

  @Authorized(Role.ADMIN, Role.USER)
  @Mutation(() => TorrentClient)
  async addTorrentClient(
    @Arg("addTorrentClientInput") addTorrentClientInput: AddTorrentClientInput,
    @Ctx() ctx: Context
  ): Promise<PRISMA_TorrentClient> {
    if (!ctx.user) {
      throw new NotFoundError("User not found");
    }

    const existingTorrentClient = await ctx.prisma.torrentClient.findUnique({
      where: {
        clientUrl: addTorrentClientInput.clientUrl,
      },
    });

    if (existingTorrentClient && existingTorrentClient.userId !== ctx.user.id) {
      throw new Error("Server managed by another user.");
    }

    return await ctx.prisma.torrentClient.upsert({
      where: {
        clientUrl: addTorrentClientInput.clientUrl,
      },
      update: {
        clientUsername: addTorrentClientInput.clientUsername,
        clientPassword: addTorrentClientInput.clientPassword,
      },

      create: {
        clientUrl: addTorrentClientInput.clientUrl,
        clientUsername: addTorrentClientInput.clientUsername,
        clientPassword: addTorrentClientInput.clientPassword,
        user: {
          connect: {
            id: ctx.user.id,
          },
        },
      },
    });
  }
}
