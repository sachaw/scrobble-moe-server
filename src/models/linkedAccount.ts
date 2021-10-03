import "reflect-metadata";

import { Field, ID, InputType, ObjectType, registerEnumType } from "type-graphql";

import type { Prisma as PrismaType, Provider as ProviderType } from "@prisma/client";
import pkg from "@prisma/client";

import { ArrayFilter } from "../utils/types/ArrayFilter.js";
import { EnumFilter } from "../utils/types/EnumFilter.js";
import { StringFilter } from "../utils/types/StringFilter.js";
import { FilterWhereInput, FindManyWithScopeInput, WhereUniqueInput } from "./helperTypes.js";
import { Scrobble, ScrobbleArrayFilter } from "./scrobble.js";
import { BaseUserFilterWhereInput, User } from "./user.js";

const { Prisma, Provider } = pkg;
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
  provider?: ProviderEnumFilter;

  @Field({ nullable: true })
  accountId?: StringFilter;

  @Field({ nullable: true })
  accessTokenExpires?: StringFilter;
}

@InputType()
export class LinkedAccountFilterWhereInput extends BaseLinkedAccountFilterWhereInput {
  @Field({ nullable: true })
  scrobbles?: ScrobbleArrayFilter;

  @Field(() => BaseUserFilterWhereInput, { nullable: true })
  user?: BaseUserFilterWhereInput;
}

@InputType()
export class LinkedAccountArrayFilter extends ArrayFilter(BaseLinkedAccountFilterWhereInput) {}

@InputType()
export class LinkedAccountUniqueInput extends WhereUniqueInput {
  @Field({ nullable: true })
  accountId?: string;
}

@InputType()
export class LinkedAccountFindManyInput extends FindManyWithScopeInput {
  @Field(() => LinkedAccountFilterWhereInput, { nullable: true })
  where?: LinkedAccountFilterWhereInput;

  @Field(() => LinkedAccountUniqueInput, { nullable: true })
  cursor?: LinkedAccountUniqueInput;

  @Field(() => Prisma.LinkedAccountScalarFieldEnum, { nullable: true })
  distinct?: PrismaType.LinkedAccountScalarFieldEnum;
}

@InputType()
export class ProviderLoginUrlInput {
  @Field(() => [Provider])
  providers: ProviderType[];
}

@InputType()
export class AddLinkedAccountInput {
  @Field()
  code: string;
}

@ObjectType()
export class ProviderLoginUrlResponse {
  @Field(() => Provider)
  provider: ProviderType;

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
  provider: ProviderType;

  @Field()
  accountId: string;

  @Field()
  accessTokenExpires?: string;

  @Field(() => [Scrobble])
  scrobbles: Scrobble[];

  @Field(() => User)
  user: User;
}
