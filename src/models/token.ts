import "reflect-metadata";

import { Field, ID, InputType, ObjectType, registerEnumType } from "type-graphql";

import { Prisma, TokenType } from "@prisma/client";

import {
  DateTimeFilter,
  FilterWhereInput,
  FindManyWithScopeInput,
  StringFilter,
  WhereUniqueInput,
} from "./helperTypes";
import { User, UserFilterWhereInput } from "./user";

registerEnumType(TokenType, {
  name: "TokenType",
});

registerEnumType(Prisma.TokenScalarFieldEnum, {
  name: "TokenScalarFieldEnum",
});

@InputType()
export class TokenFilterWhereInput extends FilterWhereInput {
  @Field(() => UserFilterWhereInput, { nullable: true })
  user: UserFilterWhereInput;

  @Field({ nullable: true })
  hashedToken: StringFilter;

  @Field({ nullable: true })
  expiresAt: DateTimeFilter;

  @Field(() => TokenType, { nullable: true })
  type: TokenType;
}

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
