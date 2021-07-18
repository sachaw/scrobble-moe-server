import 'reflect-metadata';

import { Field, ID, ObjectType } from 'type-graphql';

import { Scrobble } from './scrobble';
import { User } from './user';

@ObjectType()
export class Server {
  @Field((type) => ID)
  id: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field()
  uuid: string;

  @Field()
  secret: string;

  @Field((type) => [User])
  users: User[];

  @Field((type) => [Scrobble])
  scrobbles: Scrobble[];
}
