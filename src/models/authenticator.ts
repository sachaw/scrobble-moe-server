import "reflect-metadata";

import { Field, ID, ObjectType, registerEnumType } from "type-graphql";

import { User } from "./user";

enum Transport {
  USB,
  BLE,
  NFC,
  INTERNAL,
}

registerEnumType(Transport, {
  name: "Transport",
});

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

  @Field(() => User)
  revokedBy: User;
}
