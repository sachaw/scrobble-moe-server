import 'reflect-metadata';

import { Field, ID, ObjectType, registerEnumType } from 'type-graphql';

import { User } from './user';

enum TokenType {
  ACCESS,
  REFRESH,
}

registerEnumType(TokenType, {
  name: "TokenType",
});

@ObjectType()
export class Token {
  @Field((type) => ID)
  id: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field()
  expiresAt: Date;

  @Field((type) => TokenType)
  type: TokenType;

  @Field((type) => User)
  user: User;
}
