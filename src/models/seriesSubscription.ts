import "reflect-metadata";

import { Field, InputType, Int, ObjectType, registerEnumType } from "type-graphql";

import type { Prisma as PrismaType } from "@prisma/client";
import pkg from "@prisma/client";

import { ArrayFilter } from "../utils/types/ArrayFilter.js";
import { IntFilter } from "../utils/types/IntFilter.js";
import { StringFilter } from "../utils/types/StringFilter.js";
import { BaseEncoderFilterWhereInput, Encoder } from "./encoder.js";
import {
  BasePrismaModel,
  FilterWhereInput,
  FindManyWithScopeInput,
  WhereUniqueInput,
} from "./helperTypes.js";
import { AniListData } from "./scrobble.js";
import { BaseUserFilterWhereInput, User } from "./user.js";

const { Prisma } = pkg;
registerEnumType(Prisma.SeriesSubscriptionScalarFieldEnum, {
  name: "SeriesSubscriptionScalarFieldEnum",
});

@InputType()
export class BaseSeriesSubscriptionFilterWhereInput extends FilterWhereInput {
  @Field({ nullable: true })
  nameIncludes?: StringFilter;

  @Field({ nullable: true })
  nameExcludes?: StringFilter;

  @Field({ nullable: true })
  episodeOffset?: IntFilter;

  @Field({ nullable: true })
  providerMediaId?: StringFilter;
}

@InputType()
export class SeriesSubscriptionFilterWhereInput extends BaseSeriesSubscriptionFilterWhereInput {
  @Field(() => BaseUserFilterWhereInput, { nullable: true })
  user?: BaseUserFilterWhereInput;

  @Field(() => BaseEncoderFilterWhereInput, { nullable: true })
  encoder?: BaseEncoderFilterWhereInput;
}

@InputType()
export class SeriesSubscriptionArrayFilter extends ArrayFilter(
  BaseSeriesSubscriptionFilterWhereInput
) {}

@InputType()
export class SeriesSubscriptionFindManyInput extends FindManyWithScopeInput {
  @Field(() => SeriesSubscriptionFilterWhereInput, { nullable: true })
  where?: SeriesSubscriptionFilterWhereInput;

  @Field(() => WhereUniqueInput, { nullable: true })
  cursor?: WhereUniqueInput;

  @Field(() => Prisma.SeriesSubscriptionScalarFieldEnum, { nullable: true })
  distinct?: PrismaType.SeriesSubscriptionScalarFieldEnum;
}

@ObjectType()
export class SeriesSubscription extends BasePrismaModel {
  @Field()
  nameIncludes: string;

  @Field(() => String, { nullable: true })
  nameExcludes?: string;

  @Field(() => Int)
  episodeOffset: number;

  @Field()
  providerMediaId: string;

  @Field(() => User)
  user: User;

  @Field(() => Encoder)
  encoder: Encoder;

  @Field(() => AniListData, { nullable: true })
  anilist: AniListData;
}

@InputType()
export class AddSeriesSubscriptionInput {
  @Field()
  nameIncludes: string;

  @Field({ nullable: true })
  nameExcludes?: string;

  @Field()
  episodeOffset: number;

  @Field()
  providerMediaId: string;

  @Field()
  encoderId: string;
}
