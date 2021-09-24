import "reflect-metadata";

import { Field, ID, InputType, ObjectType, registerEnumType } from "type-graphql";

import { Prisma } from "@prisma/client";

import { ArrayFilter } from "../utils/types/ArrayFilter";
import { StringFilter } from "../utils/types/StringFilter";
import { BaseEncoderFilterWhereInput, Encoder } from "./encoder";
import { FilterWhereInput, FindManyWithScopeInput, WhereUniqueInput } from "./helperTypes";
import { BaseUserFilterWhereInput, User } from "./user";

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
  distinct?: Prisma.SeriesSubscriptionScalarFieldEnum;
}

@ObjectType()
export class SeriesSubscription {
  @Field(() => ID)
  id: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field()
  nameIncludes: string;

  @Field(() => [String])
  nameExcludes: string[];

  @Field()
  providerMediaId: string;

  @Field(() => User)
  user: User;

  @Field(() => Encoder)
  encoder: Encoder;
}
