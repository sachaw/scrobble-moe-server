import "reflect-metadata";

import { IsEmail } from "class-validator";
import { Field, ID, ObjectType, registerEnumType } from "type-graphql";

import { Authenticator } from "./authenticator";
import { LinkedAccount } from "./linkedAccount";
import { Scrobble } from "./scrobble";
import { SeriesSubscription } from "./seriesSubscription";
import { Server } from "./server";
import { Session } from "./session";
import { Token } from "./token";
import { TorrentClient } from "./torrentClient";

enum Role {
  USER,
  ADMIN,
}

registerEnumType(Role, {
  name: "Role",
});

@ObjectType()
export class User {
  @Field(() => ID)
  id: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field({ nullable: true })
  username?: string;

  @Field()
  @IsEmail()
  email: string;

  @Field()
  plexUUID: string;

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

  @Field(() => [Session])
  sessions: Session[];

  @Field(() => [Scrobble])
  scrobbles: Scrobble[];

  @Field(() => [Server])
  servers: Server[];

  @Field(() => [TorrentClient])
  torrentClients: TorrentClient[];

  @Field(() => [SeriesSubscription])
  seriesSubscriptions: SeriesSubscription[];
}
