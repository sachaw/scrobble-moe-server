import "reflect-metadata";

import { Field, ObjectType } from "type-graphql";

@ObjectType()
export class Webhook {
  @Field()
  success: boolean;
}
