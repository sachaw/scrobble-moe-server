import "reflect-metadata";

import { Field, InputType, ObjectType } from "type-graphql";

@ObjectType()
export class PlexLoginUrl {
  @Field()
  url: string;

  @Field()
  token: number;
}

@InputType()
export class PlexPinInput {
  @Field()
  pin: number;
}

@ObjectType()
export class TemporaryTokenResponse {
  @Field()
  token: string;

  @Field()
  tokenExpires: Date;
}

@ObjectType()
export class TokenResponse {
  @Field()
  accessToken: string;

  @Field()
  refreshToken: string;

  @Field()
  accessTokenExpires: Date;

  @Field()
  refreshTokenExpires: Date;
}

@ObjectType()
export class AssertionOptions {
  @Field()
  assertionOptions: string;
}

@ObjectType()
export class AttestationOptions {
  @Field()
  attestationOptions: string;
}

@InputType()
export class AttestationVerificationInput {
  @Field()
  attestationVerificationInput: string;
}

@InputType()
export class AssertionVerificationInput {
  @Field()
  assertionVerificationInput: string;
}
