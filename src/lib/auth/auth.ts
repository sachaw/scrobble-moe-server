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
export class PlexUser {
  @Field()
  username: string;

  @Field()
  avatar: string;
}

@ObjectType()
export class AuthResponse {
  @Field(() => AuthenticationType)
  type: AuthenticationType;

  @Field()
  webauthnOptions: string;

  @Field(() => PlexUser)
  plexUser: PlexUser;
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
  success: boolean;
}

@ObjectType()
export class AuthCheckResponse {
  @Field()
  authenticated: boolean;
}
