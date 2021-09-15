import "reflect-metadata";

import { Field, ID, ObjectType } from "type-graphql";

import { Scrobble } from "./scrobble";
import { User } from "./user";

@ObjectType()
export class Server {
  @Field(() => ID)
  id: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field()
  uuid: string;

  @Field()
  secret: string;

  @Field()
  name: string;

  @Field(() => [User])
  users: User[];

  @Field(() => [Scrobble])
  scrobbles: Scrobble[];
}

@ObjectType()
export class ServerResult {
  @Field()
  name: string;

  @Field()
  address: string;

  @Field()
  port: number;

  @Field()
  version: string;

  @Field()
  scheme: string;

  @Field()
  host: string;

  @Field()
  localAddresses: string;

  @Field()
  machineIdentifier: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field()
  owned: boolean;

  @Field()
  synced: boolean;
}
