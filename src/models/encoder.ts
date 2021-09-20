import "reflect-metadata";

import { Field, ID, InputType, ObjectType, registerEnumType } from "type-graphql";

import { Prisma } from "@prisma/client";

import { StringFilter } from "../utils/types/StringFilter";
import { FilterWhereInput, FindManyInput, WhereUniqueInput } from "./helperTypes";
import { SeriesSubscription, SeriesSubscriptionArrayFilter } from "./seriesSubscription";

registerEnumType(Prisma.EncoderScalarFieldEnum, {
  name: "EncoderScalarFieldEnum",
});

@InputType()
export class BaseEncoderFilterWhereInput extends FilterWhereInput {
  @Field({ nullable: true })
  name: StringFilter;

  @Field({ nullable: true })
  rssURL: string;
}

@InputType()
export class EncoderFilterWhereInput extends BaseEncoderFilterWhereInput {
  @Field(() => SeriesSubscriptionArrayFilter, { nullable: true })
  userSubscriptions: SeriesSubscriptionArrayFilter;
}

@InputType()
export class EncoderUniqueInput extends WhereUniqueInput {
  @Field({ nullable: true })
  name: string;
}

@InputType()
export class EncoderFindManyInput extends FindManyInput {
  @Field(() => EncoderFilterWhereInput, { nullable: true })
  where: EncoderFilterWhereInput;

  @Field(() => EncoderUniqueInput, { nullable: true })
  cursor: EncoderUniqueInput;

  @Field(() => Prisma.EncoderScalarFieldEnum, { nullable: true })
  distinct: Prisma.EncoderScalarFieldEnum;
}

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
