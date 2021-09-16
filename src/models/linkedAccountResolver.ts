import "reflect-metadata";

import axios from "axios";
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
import { LinkedAccount as PRISMA_LinkedAccount, Role, Scrobble, User } from "@prisma/client";

import { Context } from "../lib/context";
import { env } from "../lib/env";
import { LinkedAccount } from "./linkedAccount";

@InputType()
class AddLinkedAccountInput {
  @Field()
  code: string;
}

@Resolver(LinkedAccount)
export class LinkedAccountResolver {
  @FieldResolver()
  async scrobbles(@Root() linkedAccount: LinkedAccount, @Ctx() ctx: Context): Promise<Scrobble[]> {
    return await ctx.prisma.linkedAccount
      .findUnique({
        where: {
          id: linkedAccount.id,
        },
      })
      .scrobbles();
  }

  @FieldResolver()
  async user(@Root() linkedAccount: LinkedAccount, @Ctx() ctx: Context): Promise<User> {
    const user = await ctx.prisma.linkedAccount
      .findUnique({
        where: {
          id: linkedAccount.id,
        },
      })
      .user();

    if (!user) {
      throw new NotFoundError("User not found");
    }
    return user;
  }

  @Authorized(Role.ADMIN)
  @Query(() => [LinkedAccount])
  async allLinkedAccounts(@Ctx() ctx: Context): Promise<PRISMA_LinkedAccount[]> {
    return await ctx.prisma.linkedAccount.findMany();
  }

  @Authorized(Role.ADMIN, Role.USER)
  @Mutation(() => LinkedAccount, { nullable: true })
  async addLinkedAccount(
    @Arg("addLinkedAccountInput") addLinkedAccountInput: AddLinkedAccountInput,
    @Ctx() ctx: Context
  ): Promise<void> {
    const anilistToken = await axios.post(
      "https://anilist.co/api/v2/oauth/token",
      {
        grant_type: "authorization_code",
        client_id: env.ANILIST_ID,
        client_secret: env.ANILIST_SECRET,
        redirect_uri: "",
        code: addLinkedAccountInput.code,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    console.log(anilistToken);

    // const servers = await getPlexServers(ctx.user.plexAuthToken);

    // const serverToAdd = servers.find(
    //   (server) => server._attributes.machineIdentifier === addLinkedAccountInput.machineIdentifier
    // );

    // if (serverToAdd) {
    //   return await ctx.prisma.server.upsert({
    //     where: {
    //       uuid: serverToAdd._attributes.machineIdentifier,
    //     },
    //     update: {
    //       name: serverToAdd._attributes.name,
    //     },

    //     create: {
    //       secret: "abc",
    //       uuid: serverToAdd._attributes.machineIdentifier,
    //       name: serverToAdd._attributes.name,
    //       users: {
    //         connect: {
    //           id: ctx.user.id,
    //         },
    //       },
    //     },
    //   });
    // }

    throw new NotFoundError("code");
  }
}
