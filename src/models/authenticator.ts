import "reflect-metadata";

import { GraphQLByte } from "graphql-scalars";
import { Field, InputType, ObjectType, registerEnumType } from "type-graphql";

import type { Prisma as PrismaType, Transport as TransportType } from "@prisma/client";
import pkg from "@prisma/client";

import { ArrayFilter } from "../utils/types/ArrayFilter.js";
import { BytesFilter } from "../utils/types/BytesFilter.js";
import { EnumArrayFilter } from "../utils/types/EnumArrayFilter.js";
import { IntFilter } from "../utils/types/IntFilter.js";
import { StringFilter } from "../utils/types/StringFilter.js";
import {
  BasePrismaModel,
  FilterWhereInput,
  FindManyWithScopeInput,
  WhereUniqueInput,
} from "./helperTypes.js";
import { BaseUserFilterWhereInput, User } from "./user.js";

const { Prisma, Transport } = pkg;
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
  distinct?: PrismaType.AuthenticatorScalarFieldEnum;
}

@ObjectType()
export class Authenticator extends BasePrismaModel {
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
  transports: TransportType[];

  @Field(() => User)
  user: User;
}
