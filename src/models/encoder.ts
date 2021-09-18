import "reflect-metadata";

import { Field, ID, InputType, ObjectType, registerEnumType } from "type-graphql";

import { Prisma } from "@prisma/client";

import { FilterWhereInput, FindManyInput, StringFilter, WhereUniqueInput } from "./helperTypes";
import { SeriesSubscription, SeriesSubscriptionFilterWhereInput } from "./seriesSubscription";

registerEnumType(Prisma.EncoderScalarFieldEnum, {
  name: "EncoderScalarFieldEnum",
});

@InputType()
export class EncoderFilterWhereInput extends FilterWhereInput {
  @Field({ nullable: true })
  name: StringFilter;

  /**
   * @todo URL scalar
   */
  @Field({ nullable: true })
  rssURL: StringFilter;

  @Field(() => SeriesSubscriptionFilterWhereInput, { nullable: true })
  userSubscriptions: SeriesSubscriptionFilterWhereInput;
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
