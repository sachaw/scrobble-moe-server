import 'reflect-metadata';

import { Field, ID, ObjectType, registerEnumType } from 'type-graphql';

import { LinkedAccount } from './linkedAccount';
import { Server } from './server';
import { User } from './user';

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
  @Field((type) => ID)
  id: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field((type) => ScrobbleStatus)
  status: ScrobbleStatus;

  @Field()
  providerMediaId: string;

  @Field()
  episode: number;

  @Field((type) => User)
  user: User;

  @Field((type) => Server)
  server: Server;

  @Field((type) => [LinkedAccount])
  accounts: LinkedAccount[];
}
