import "reflect-metadata";

import { Field, InputType, ObjectType, registerEnumType } from "type-graphql";

import type { Prisma as PrismaType } from "@prisma/client";
import pkg from "@prisma/client";

import { StringFilter } from "../utils/types/StringFilter.js";
import {
  BasePrismaModel,
  FilterWhereInput,
  FindManyInput,
  WhereUniqueInput,
} from "./helperTypes.js";
import { SeriesSubscription, SeriesSubscriptionArrayFilter } from "./seriesSubscription.js";

const { Prisma } = pkg;
registerEnumType(Prisma.EncoderScalarFieldEnum, {
  name: "EncoderScalarFieldEnum",
});

@InputType()
export class BaseEncoderFilterWhereInput extends FilterWhereInput {
  @Field({ nullable: true })
  name?: StringFilter;

  @Field({ nullable: true })
  rssURL?: string;

  @Field({ nullable: true })
  matchRegex?: string;
}

@InputType()
export class EncoderFilterWhereInput extends BaseEncoderFilterWhereInput {
  @Field(() => SeriesSubscriptionArrayFilter, { nullable: true })
  userSubscriptions?: SeriesSubscriptionArrayFilter;
}

@InputType()
export class EncoderUniqueInput extends WhereUniqueInput {
  @Field({ nullable: true })
  name?: string;
}

@InputType()
export class EncoderFindManyInput extends FindManyInput {
  @Field(() => EncoderFilterWhereInput, { nullable: true })
  where?: EncoderFilterWhereInput;

  @Field(() => EncoderUniqueInput, { nullable: true })
  cursor?: EncoderUniqueInput;

  @Field(() => Prisma.EncoderScalarFieldEnum, { nullable: true })
  distinct?: PrismaType.EncoderScalarFieldEnum;
}

@ObjectType()
export class Encoder extends BasePrismaModel {
  @Field()
  name: string;

  @Field()
  rssURL: string;

  @Field()
  matchRegex: string;

  @Field(() => [SeriesSubscription])
  userSubscriptions: SeriesSubscription[];
}

@InputType()
export class AddEncoderInput {
  @Field()
  name: string;

  @Field()
  rssURL: string;

  @Field()
  matchRegex: string;
}

@InputType()
export class EncoderFeedInput {
  @Field()
  id: string;
}

@ObjectType()
export class RssItem {
  @Field()
  title: string;

  @Field()
  link: string;

  @Field()
  pubDate: string;

  @Field()
  content: string;

  @Field()
  contentSnippet: string;

  @Field()
  guid: string;

  @Field()
  isoDate: string;
}
