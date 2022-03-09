import "reflect-metadata";

import { Field, InputType, ObjectType, registerEnumType } from "type-graphql";

import type {
  Provider as ProviderType,
  ScrobbleStatus as ScrobbleStatusType,
} from "@prisma/client";
import pkg from "@prisma/client";

import { ArrayFilter } from "../utils/types/ArrayFilter.js";
import { EnumFilter } from "../utils/types/EnumFilter.js";
import { BasePrismaModel, FilterWhereInput } from "./helperTypes.js";
import { Scrobble } from "./scrobble.js";

const { Provider, ScrobbleStatus } = pkg;

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
  status?: ScrobbleStatusEnumFilter;
}

@InputType()
export class ScrobbleProviderStatusArrayFilter extends ArrayFilter(
  BaseScrobbleProviderStatusFilterWhereInput
) {}

@ObjectType()
export class ScrobbleProviderStatus extends BasePrismaModel {
  @Field(() => ScrobbleStatus)
  status: ScrobbleStatusType;

  @Field(() => Provider)
  provider: ProviderType;

  @Field(() => Scrobble)
  scrobble: Scrobble;
}
