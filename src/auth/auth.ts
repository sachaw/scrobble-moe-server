import 'reflect-metadata';

import { Field, ObjectType } from 'type-graphql';

// @ObjectType()
// export class AttestationOptions {
//   @Field()
//   options: PublicKeyCredentialCreationOptionsJSON;
// }

@ObjectType()
export class PlexLoginUrl {
  @Field()
  url: string;

  @Field()
  token: number;
}

@ObjectType()
export class PlexPinResponse {
  @Field()
  accessToken: string;

  @Field()
  refreshToken: string;

  @Field()
  accessTokenExpires: string;

  @Field()
  refreshTokenExpires: string;
}
