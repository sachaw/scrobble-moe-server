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
import { Role, Scrobble, User } from "@prisma/client";

import { Context } from "../lib/context";
import { LinkedAccount } from "./linkedAccount";

@InputType()
class AddLinkedAccountInput {
  @Field()
  code: string;
}

@Resolver(LinkedAccount)
export class LinkedAccountResolver {
  constructor() {}

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
    return await ctx.prisma.linkedAccount
      .findUnique({
        where: {
          id: linkedAccount.id,
        },
      })
      .user();
  }

  @Authorized(Role.ADMIN)
  @Query((returns) => [LinkedAccount])
  async allLinkedAccounts(@Ctx() ctx: Context) {
    return await ctx.prisma.linkedAccount.findMany();
  }

  @Authorized(Role.ADMIN, Role.USER)
  @Mutation((returns) => LinkedAccount, { nullable: true })
  async addLinkedAccount(
    @Arg("addLinkedAccountInput") addLinkedAccountInput: AddLinkedAccountInput,
    @Ctx() ctx: Context
  ) {
    const anilistToken = await axios.post(
      "https://anilist.co/api/v2/oauth/token",
      {
        grant_type: "authorization_code",
        client_id: process.env.ANILIST_ID,
        client_secret: process.env.ANILIST_SECRET,
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
