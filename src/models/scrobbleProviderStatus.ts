import "reflect-metadata";

import { Field, ID, ObjectType, registerEnumType } from "type-graphql";

import { Provider, ScrobbleStatus } from "@prisma/client";

import { Scrobble } from "./scrobble";

registerEnumType(ScrobbleStatus, {
  name: "ScrobbleStatus",
});

registerEnumType(Provider, {
  name: "Provider",
});

@ObjectType()
export class ScrobbleProviderStatus {
  @Field(() => ID)
  id: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => ScrobbleStatus)
  status: ScrobbleStatus;

  @Field(() => Provider)
  provider: Provider;

  @Field(() => Scrobble)
  scrobble: Scrobble;
}
