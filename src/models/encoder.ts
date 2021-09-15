import "reflect-metadata";

import { Field, ID, ObjectType } from "type-graphql";

import { SeriesSubscription } from "./seriesSubscription";

@ObjectType()
export class Encoder {
  @Field(() => ID)
  id: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field()
  name: string;

  @Field()
  rssURL: string;

  @Field(() => [SeriesSubscription])
  userSubscriptions: SeriesSubscription[];
}
