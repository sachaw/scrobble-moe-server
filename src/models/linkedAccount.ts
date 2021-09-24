import "reflect-metadata";

import { Field, ID, InputType, ObjectType, registerEnumType } from "type-graphql";

import { Prisma, Provider } from "@prisma/client";

import { ArrayFilter } from "../utils/types/ArrayFilter";
import { EnumFilter } from "../utils/types/EnumFilter";
import { StringFilter } from "../utils/types/StringFilter";
import { FilterWhereInput, FindManyWithScopeInput, WhereUniqueInput } from "./helperTypes";
import { Scrobble, ScrobbleArrayFilter } from "./scrobble";
import { BaseUserFilterWhereInput, User } from "./user";

registerEnumType(Provider, {
  name: "Provider",
});

registerEnumType(Prisma.LinkedAccountScalarFieldEnum, {
  name: "LinkedAccountScalarFieldEnum",
});

@InputType()
export class ProviderEnumFilter extends EnumFilter(Provider) {}

@InputType()
export class BaseLinkedAccountFilterWhereInput extends FilterWhereInput {
  @Field(() => ProviderEnumFilter, { nullable: true })
  provider: ProviderEnumFilter;

  @Field({ nullable: true })
  accountId: StringFilter;

  @Field({ nullable: true })
  accessTokenExpires: StringFilter;
}

@InputType()
export class LinkedAccountFilterWhereInput extends BaseLinkedAccountFilterWhereInput {
  @Field({ nullable: true })
  scrobbles: ScrobbleArrayFilter;

  @Field(() => BaseUserFilterWhereInput, { nullable: true })
  user: BaseUserFilterWhereInput;
}

@InputType()
export class LinkedAccountArrayFilter extends ArrayFilter(BaseLinkedAccountFilterWhereInput) {}

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
  @Field(() => [Provider])
  providers: Provider[];
}

@InputType()
export class AddLinkedAccountInput {
  @Field()
  code: string;
}

@ObjectType()
export class ProviderLoginUrlResponse {
  @Field(() => Provider)
  provider: Provider;

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
