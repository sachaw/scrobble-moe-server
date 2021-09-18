import "reflect-metadata";

import { IsEmail } from "class-validator";
import { Field, ID, InputType, ObjectType, registerEnumType } from "type-graphql";

import { Role } from "@prisma/client";

import { Authenticator } from "./authenticator";
import { FilterWhereInput, IntFilter, StringFilter } from "./helperTypes";
import { LinkedAccount } from "./linkedAccount";
import { Scrobble } from "./scrobble";
import { SeriesSubscription } from "./seriesSubscription";
import { Server } from "./server";
import { Token } from "./token";
import { TorrentClient } from "./torrentClient";

registerEnumType(Role, {
  name: "Role",
});

@InputType()
export class UserFilterWhereInput extends FilterWhereInput {
  @Field(() => StringFilter, { nullable: true })
  username: StringFilter; //replace

  @Field(() => StringFilter, { nullable: true })
  email: StringFilter; //replace

  @Field({ nullable: true })
  plexId: IntFilter;
}

@InputType()
export class UserUniqueInput {
  @Field({ nullable: true })
  id: string;
}

@ObjectType()
export class User {
  @Field(() => ID)
  id: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field()
  username: string;

  @Field()
  @IsEmail()
  email: string;

  @Field()
  plexId: string;

  @Field()
  thumb: string;

  @Field()
  authenticationChallenge: string;

  @Field()
  authenticationChallengeExpiresAt: Date;

  @Field(() => Role)
  role: Role;

  @Field(() => [Authenticator])
  authenticators: Authenticator[];

  @Field(() => [LinkedAccount])
  accounts: LinkedAccount[];

  @Field(() => [Token])
  tokens: Token[];

  @Field(() => [Scrobble])
  scrobbles: Scrobble[];

  @Field(() => [Server])
  servers: Server[];

  @Field(() => [TorrentClient])
  torrentClients: TorrentClient[];

  @Field(() => [SeriesSubscription])
  seriesSubscriptions: SeriesSubscription[];
}
