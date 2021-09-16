import "reflect-metadata";

import { Field, ID, InputType, ObjectType, registerEnumType } from "type-graphql";

import { Scrobble } from "./scrobble";
import { User } from "./user";
import { Provider } from ".pnpm/@prisma+client@3.0.2_prisma@3.0.2/node_modules/.prisma/client";

registerEnumType(Provider, {
  name: "Provider",
});

@InputType()
export class ProviderLoginUrlInput {
  @Field(() => Provider)
  provider: Provider;
}

@InputType()
export class AddLinkedAccountInput {
  @Field()
  code: string;
}

@ObjectType()
export class ProviderLoginUrlResponse {
  @Field()
  url: string;
}

@ObjectType()
export class LinkedAccount {
  @Field(() => ID)
  id: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => Provider)
  provider: Provider;

  @Field()
  accountId: string;

  @Field()
  accessTokenExpires: string;

  @Field(() => [Scrobble])
  scrobbles: Scrobble[];

  @Field(() => User)
  user: User;
}
