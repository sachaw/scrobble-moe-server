import "reflect-metadata";

import { Field, ID, ObjectType, registerEnumType } from "type-graphql";

import { Scrobble } from "./scrobble";
import { User } from "./user";

enum Provider {
  ANILIST,
  KITSU,
}

registerEnumType(Provider, {
  name: "Provider",
});

@ObjectType()
export class LinkedAccount {
  @Field(() => ID)
  id: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => Provider)
  provider: Provider;

  @Field()
  accountId: string;

  @Field()
  accessTokenExpires: string;

  @Field(() => [Scrobble])
  scrobbles: Scrobble[];

  @Field(() => User)
  user: User;
}
