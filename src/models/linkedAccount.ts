import 'reflect-metadata';

import { Field, ID, ObjectType, registerEnumType } from 'type-graphql';

import { Scrobble } from './scrobble';
import { User } from './user';

enum Provider {
  ANILIST,
  KITSU,
}

registerEnumType(Provider, {
  name: "Provider",
});

@ObjectType()
export class LinkedAccount {
  @Field((type) => ID)
  id: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field((type) => Provider)
  provider: Provider;

  @Field()
  accountId: string;

  @Field()
  accessTokenExpires: string;

  @Field((type) => [Scrobble])
  scrobbles: Scrobble[];

  @Field((type) => User)
  user: User;
}
