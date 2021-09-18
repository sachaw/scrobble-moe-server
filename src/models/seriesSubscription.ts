import "reflect-metadata";

import { Field, ID, InputType, ObjectType, registerEnumType } from "type-graphql";

import { Prisma } from "@prisma/client";

import { Encoder } from "./encoder";
import {
  FilterWhereInput,
  FindManyWithScopeInput,
  StringFilter,
  WhereUniqueInput,
} from "./helperTypes";
import { User, UserFilterWhereInput } from "./user";

registerEnumType(Prisma.SeriesSubscriptionScalarFieldEnum, {
  name: "SeriesSubscriptionScalarFieldEnum",
});

@InputType()
export class SeriesSubscriptionFilterWhereInput extends FilterWhereInput {
  @Field({ nullable: true })
  nameIncludes: StringFilter;

  @Field({ nullable: true })
  nameExcludes: StringFilter;

  @Field({ nullable: true })
  providerMediaId: StringFilter;

  @Field(() => UserFilterWhereInput, { nullable: true })
  user: UserFilterWhereInput;

  /**
   * @todo Implement
   */
  // encoder
}

@InputType()
export class SeriesSubscriptionFindManyInput extends FindManyWithScopeInput {
  @Field(() => SeriesSubscriptionFilterWhereInput, { nullable: true })
  where: SeriesSubscriptionFilterWhereInput;

  @Field(() => WhereUniqueInput, { nullable: true })
  cursor: WhereUniqueInput;

  @Field(() => Prisma.SeriesSubscriptionScalarFieldEnum, { nullable: true })
  distinct: Prisma.SeriesSubscriptionScalarFieldEnum;
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
