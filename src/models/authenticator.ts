import "reflect-metadata";

import { Field, ID, InputType, ObjectType, registerEnumType } from "type-graphql";

import { Prisma, Transport } from "@prisma/client";

import {
  FilterWhereInput,
  FindManyWithScopeInput,
  IntFilter,
  StringFilter,
  WhereUniqueInput,
} from "./helperTypes";
import { User, UserFilterWhereInput } from "./user";

registerEnumType(Transport, {
  name: "Transport",
});

registerEnumType(Prisma.AuthenticatorScalarFieldEnum, {
  name: "AuthenticatorScalarFieldEnum",
});

/**
 * FIXME:
 */
@InputType()
export class AuthenticatorFilterWhereInput extends FilterWhereInput {
  @Field({ nullable: true })
  AAGUID: StringFilter;

  /**
   * @todo fix
   */
  @Field({ nullable: true })
  credentialID: StringFilter; ///BytesFilter

  /**
   * @todo fix
   */
  @Field({ nullable: true })
  credentialPublicKey: StringFilter; ///BytesFilter

  @Field({ nullable: true })
  counter: IntFilter;

  @Field({ nullable: true })
  revoked: boolean;

  @Field(() => Transport, { nullable: true })
  transports: Transport;

  @Field(() => UserFilterWhereInput, { nullable: true })
  user: UserFilterWhereInput;
}

@InputType()
export class AuthenticatorUniqueInput extends WhereUniqueInput {
  @Field({ nullable: true })
  credentialID: string; // @TODO: should be of type Bytes
}

@InputType()
export class AuthenticatorFindManyInput extends FindManyWithScopeInput {
  @Field(() => AuthenticatorFilterWhereInput, { nullable: true })
  where: AuthenticatorFilterWhereInput;

  @Field(() => AuthenticatorUniqueInput, { nullable: true })
  cursor: AuthenticatorUniqueInput;

  @Field(() => Prisma.AuthenticatorScalarFieldEnum, { nullable: true })
  distinct: Prisma.AuthenticatorScalarFieldEnum;
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

  @Field()
  credentialID: string; // @TODO: should be of type Bytes

  @Field()
  credentialPublicKey: string; // @TODO: should be of type Bytes

  @Field()
  counter: number;

  @Field()
  revoked: boolean;

  @Field(() => Transport)
  transports: Transport;

  @Field(() => User)
  user: User;
}
