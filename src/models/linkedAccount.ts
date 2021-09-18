import "reflect-metadata";

import { Field, ID, InputType, ObjectType, registerEnumType } from "type-graphql";

import { Prisma, Provider } from "@prisma/client";

import {
  FilterWhereInput,
  FindManyWithScopeInput,
  StringFilter,
  WhereUniqueInput,
} from "./helperTypes";
import { Scrobble } from "./scrobble";
import { User, UserFilterWhereInput } from "./user";

registerEnumType(Provider, {
  name: "Provider",
});

registerEnumType(Prisma.LinkedAccountScalarFieldEnum, {
  name: "LinkedAccountScalarFieldEnum",
});

@InputType()
export class LinkedAccountFilterWhereInput extends FilterWhereInput {
  //enum
  @Field(() => Provider, { nullable: true })
  provider: Provider;

  @Field({ nullable: true })
  accountId: StringFilter;

  @Field({ nullable: true })
  accessTokenExpires: StringFilter;

  /**
   * @todo implement
   */
  // scrobbles

  @Field(() => UserFilterWhereInput, { nullable: true })
  user: UserFilterWhereInput;
}

@InputType()
export class LinkedAccountUniqueInput extends WhereUniqueInput {
  @Field({ nullable: true })
  accountId: string;
}

@InputType()
export class LinkedAccountFindManyInput extends FindManyWithScopeInput {
  @Field(() => LinkedAccountFilterWhereInput, { nullable: true })
  where: LinkedAccountFilterWhereInput;

  @Field(() => LinkedAccountUniqueInput, { nullable: true })
  cursor: LinkedAccountUniqueInput;

  @Field(() => Prisma.LinkedAccountScalarFieldEnum, { nullable: true })
  distinct: Prisma.LinkedAccountScalarFieldEnum;
}

@InputType()
export class ProviderLoginUrlInput {
  @Field(() => Provider)
  provider: Provider;
}

@InputType()
export class AddLinkedAccountInput {
  @Field()
  code: string;
}

@ObjectType()
export class ProviderLoginUrlResponse {
  @Field()
  url: string;
}

@ObjectType()
export class LinkedAccount {
  @Field(() => ID)
  id: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => Provider)
  provider: Provider;

  @Field()
  accountId: string;

  @Field()
  accessTokenExpires: string;

  @Field(() => [Scrobble])
  scrobbles: Scrobble[];

  @Field(() => User)
  user: User;
}
