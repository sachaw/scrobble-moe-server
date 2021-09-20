import "reflect-metadata";

import { Field, ID, InputType, ObjectType, registerEnumType } from "type-graphql";

import { Provider, ScrobbleStatus } from "@prisma/client";

import { ArrayFilter } from "../utils/types/ArrayFilter";
import { EnumFilter } from "../utils/types/EnumFilter";
import { FilterWhereInput } from "./helperTypes";
import { Scrobble } from "./scrobble";

registerEnumType(ScrobbleStatus, {
  name: "ScrobbleStatus",
});

registerEnumType(Provider, {
  name: "Provider",
});

@InputType()
export class ScrobbleStatusEnumFilter extends EnumFilter(ScrobbleStatus) {}

@InputType()
export class BaseScrobbleProviderStatusFilterWhereInput extends FilterWhereInput {
  @Field({ nullable: true })
  status: ScrobbleStatusEnumFilter;
}

@InputType()
export class ScrobbleProviderStatusArrayFilter extends ArrayFilter(
  BaseScrobbleProviderStatusFilterWhereInput
) {}

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
