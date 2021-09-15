import "reflect-metadata";

import { Field, ID, ObjectType } from "type-graphql";

import { Encoder } from "./encoder";
import { User } from "./user";

@ObjectType()
export class SeriesSubscription {
  @Field(() => ID)
  id: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field()
  nameIncludes: string;

  @Field(() => [String])
  nameExcludes: string[];

  @Field()
  providerMediaId: string;

  @Field(() => User)
  user: User;

  @Field(() => Encoder)
  encoder: Encoder;
}
