import 'reflect-metadata';

import { Field, ID, ObjectType } from 'type-graphql';

import { Encoder } from './encoder';
import { User } from './user';

@ObjectType()
export class SeriesSubscription {
  @Field((type) => ID)
  id: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field()
  nameIncludes: string;

  @Field((type) => [String])
  nameExcludes: string[];

  @Field()
  providerMediaId: string;

  @Field((type) => User)
  user: User;

  @Field((type) => Encoder)
  encoder: Encoder;
}
