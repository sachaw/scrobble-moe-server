import "reflect-metadata";

import { Field, InputType, ObjectType } from "type-graphql";

@InputType()
export class WebhookInput {
  @Field()
  secret: string;

  @Field()
  plexId: number;

  @Field()
  serverUUID: string;

  @Field()
  providerMediaId: number;

  @Field()
  episode: number;
}

@ObjectType()
export class Webhook {
  @Field()
  success: boolean;

  @Field()
  reason: string;
}
