import "reflect-metadata";

import { Field, InputType, ObjectType, registerEnumType } from "type-graphql";

export enum AuthenticationType {
  AUTHENTICATION,
  REGISTRATION,
}

registerEnumType(AuthenticationType, {
  name: "AuthenticationType",
});

@InputType()
export class AuthenticationInput {
  @Field()
  plexToken: string;
}

@ObjectType()
export class AuthResponse {
  @Field(() => AuthenticationType)
  type: AuthenticationType;
  @Field()
  webauthnOptions: string;
}

@InputType()
export class WebauthnInput {
  @Field(() => AuthenticationType)
  type: AuthenticationType;
  @Field()
  verification: string;
  @Field()
  plexToken: string;
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
