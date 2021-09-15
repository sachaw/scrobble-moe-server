import "reflect-metadata";

import { Field, ID, ObjectType } from "type-graphql";

import { User } from "./user";

@ObjectType()
export class Session {
  @Field(() => ID)
  id: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field()
  expiresAt: Date;

  @Field()
  antiCSRFToken: Date;

  @Field(() => User)
  user: User;
}
