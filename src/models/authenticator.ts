import "reflect-metadata";

import { GraphQLByte } from "graphql-scalars";
import { Field, ID, InputType, ObjectType, registerEnumType } from "type-graphql";

import { Prisma, Transport } from "@prisma/client";

import { ArrayFilter } from "../utils/types/ArrayFilter";
import { BytesFilter } from "../utils/types/BytesFilter";
import { EnumArrayFilter } from "../utils/types/EnumArrayFilter";
import { IntFilter } from "../utils/types/IntFilter";
import { StringFilter } from "../utils/types/StringFilter";
import { FilterWhereInput, FindManyWithScopeInput, WhereUniqueInput } from "./helperTypes";
import { BaseUserFilterWhereInput, User } from "./user";

registerEnumType(Transport, {
  name: "Transport",
});

registerEnumType(Prisma.AuthenticatorScalarFieldEnum, {
  name: "AuthenticatorScalarFieldEnum",
});

@InputType()
export class TransportEnumFilter extends EnumArrayFilter(Transport) {}

@InputType()
export class BaseAuthenticatorFilterWhereInput extends FilterWhereInput {
  @Field({ nullable: true })
  AAGUID?: StringFilter;

  @Field({ nullable: true })
  credentialID?: BytesFilter;

  @Field({ nullable: true })
  credentialPublicKey?: BytesFilter;

  @Field({ nullable: true })
  counter?: IntFilter;

  @Field({ nullable: true })
  revoked?: boolean;

  @Field(() => TransportEnumFilter, { nullable: true })
  transports?: TransportEnumFilter;
}

@InputType()
export class AuthenticatorFilterWhereInput extends BaseAuthenticatorFilterWhereInput {
  @Field(() => BaseUserFilterWhereInput, { nullable: true })
  user?: BaseUserFilterWhereInput;
}

@InputType()
export class AuthenticatorArrayFilter extends ArrayFilter(BaseAuthenticatorFilterWhereInput) {}

@InputType()
export class AuthenticatorUniqueInput extends WhereUniqueInput {
  @Field(() => GraphQLByte, { nullable: true })
  credentialID?: Buffer;
}

@InputType()
export class AuthenticatorFindManyInput extends FindManyWithScopeInput {
  @Field(() => AuthenticatorFilterWhereInput, { nullable: true })
  where?: AuthenticatorFilterWhereInput;

  @Field(() => AuthenticatorUniqueInput, { nullable: true })
  cursor?: AuthenticatorUniqueInput;

  @Field(() => Prisma.AuthenticatorScalarFieldEnum, { nullable: true })
  distinct?: Prisma.AuthenticatorScalarFieldEnum;
}

@ObjectType()
export class Authenticator {
  @Field(() => ID)
  id: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field()
  AAGUID: string;

  @Field(() => GraphQLByte)
  credentialID: Buffer;

  @Field(() => GraphQLByte)
  credentialPublicKey: Buffer;

  @Field()
  counter: number;

  @Field()
  revoked: boolean;

  @Field(() => [Transport])
  transports: Transport[];

  @Field(() => User)
  user: User;
}
