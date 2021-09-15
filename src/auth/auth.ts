import "reflect-metadata";

import { Field, InputType, ObjectType, registerEnumType } from "type-graphql";

export enum WebauthnRequestType {
  AUTHENTICATION,
  REGISTRATION,
  UNKNOWN,
}

registerEnumType(WebauthnRequestType, {
  name: "WebauthnRequestType",
});

@ObjectType()
export class PlexLoginUrl {
  @Field()
  url: string;

  @Field()
  pin: number;
}

@InputType()
export class PlexPinInput {
  @Field()
  pin: number;
}

@ObjectType()
export class PlexPinCheck {
  @Field()
  authenticated: boolean;
  @Field(() => WebauthnRequestType)
  type: WebauthnRequestType;
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
export class WebauthnOptions {
  @Field()
  webauthnOptions: string;
}

@InputType()
export class WebauthnOptionsInput {
  @Field(() => WebauthnRequestType)
  type: WebauthnRequestType;
}

@InputType()
export class WebauthnVerificationInput {
  @Field(() => WebauthnRequestType)
  type: WebauthnRequestType;
  @Field()
  verificationInput: string;
}
