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
  @Field((type) => ID)
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

  @Field((type) => Role)
  role: Role;

  @Field((type) => [Authenticator])
  authenticators: Authenticator[];

  @Field((type) => [LinkedAccount])
  accounts: LinkedAccount[];

  @Field((type) => [Token])
  tokens: Token[];

  @Field((type) => [Session])
  sessions: Session[];

  @Field((type) => [Scrobble])
  scrobbles: Scrobble[];

  @Field((type) => [Server])
  servers: Server[];

  @Field((type) => [TorrentClient])
  torrentClients: TorrentClient[];

  @Field((type) => [SeriesSubscription])
  seriesSubscriptions: SeriesSubscription[];
}
