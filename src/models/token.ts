import "reflect-metadata";

import { Field, ID, InputType, ObjectType, registerEnumType } from "type-graphql";

import { Prisma, TokenType } from "@prisma/client";

import { ArrayFilter } from "../utils/types/ArrayFilter";
import { DateTimeFilter } from "../utils/types/DateTimeFilter";
import { EnumFilter } from "../utils/types/EnumFilter";
import { StringFilter } from "../utils/types/StringFilter";
import { FilterWhereInput, FindManyWithScopeInput, WhereUniqueInput } from "./helperTypes";
import { BaseUserFilterWhereInput, User } from "./user";

registerEnumType(TokenType, {
  name: "TokenType",
});

registerEnumType(Prisma.TokenScalarFieldEnum, {
  name: "TokenScalarFieldEnum",
});

@InputType()
export class TokenTypeEnumFilter extends EnumFilter(TokenType) {}

@InputType()
export class BaseTokenFilterWhereInput extends FilterWhereInput {
  @Field({ nullable: true })
  hashedToken: StringFilter;

  @Field({ nullable: true })
  expiresAt: DateTimeFilter;

  @Field(() => TokenTypeEnumFilter, { nullable: true })
  type: TokenTypeEnumFilter;
}

@InputType()
export class TokenFilterWhereInput extends BaseTokenFilterWhereInput {
  @Field(() => BaseUserFilterWhereInput, { nullable: true })
  user: BaseUserFilterWhereInput;
}

@InputType()
export class TokenArrayFilter extends ArrayFilter(BaseTokenFilterWhereInput) {}

@InputType()
export class TokenUniqueInput extends WhereUniqueInput {
  @Field({ nullable: true })
  hashedToken: string;
}

@InputType()
export class TokenFindManyInput extends FindManyWithScopeInput {
  @Field(() => TokenFilterWhereInput, { nullable: true })
  where: TokenFilterWhereInput;

  @Field(() => TokenUniqueInput, { nullable: true })
  cursor: TokenUniqueInput;

  @Field(() => Prisma.TokenScalarFieldEnum, { nullable: true })
  distinct: Prisma.TokenScalarFieldEnum;
}

@ObjectType()
export class Token {
  @Field(() => ID)
  id: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field()
  expiresAt: Date;

  @Field(() => TokenType)
  type: TokenType;

  @Field(() => User)
  user: User;
}
