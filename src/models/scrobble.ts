import "reflect-metadata";

import { Field, ID, ObjectType, registerEnumType } from "type-graphql";

import { LinkedAccount } from "./linkedAccount";
import { Server } from "./server";
import { User } from "./user";

enum ScrobbleStatus {
  IGNORED,
  TRACKED,
  ERRORED,
}

registerEnumType(ScrobbleStatus, {
  name: "ScrobbleStatus",
});

@ObjectType()
export class Scrobble {
  @Field(() => ID)
  id: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => ScrobbleStatus)
  status: ScrobbleStatus;

  @Field()
  providerMediaId: string;

  @Field()
  episode: number;

  @Field(() => User)
  user: User;

  @Field(() => Server)
  server: Server;

  @Field(() => [LinkedAccount])
  accounts: LinkedAccount[];
}
