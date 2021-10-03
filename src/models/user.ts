import "reflect-metadata";

import { Field, ID, InputType, ObjectType, registerEnumType } from "type-graphql";

import type { Prisma as PrismaType, Role as RoleType } from "@prisma/client";
import pkg from "@prisma/client";

import { ArrayFilter } from "../utils/types/ArrayFilter.js";
import { DateTimeFilter } from "../utils/types/DateTimeFilter.js";
import { EnumFilter } from "../utils/types/EnumFilter.js";
import { IntFilter } from "../utils/types/IntFilter.js";
import { StringFilter } from "../utils/types/StringFilter.js";
import { Authenticator, AuthenticatorArrayFilter } from "./authenticator.js";
import { FilterWhereInput, FindManyWithScopeInput, WhereUniqueInput } from "./helperTypes.js";
import { LinkedAccount, LinkedAccountArrayFilter } from "./linkedAccount.js";
import { Scrobble, ScrobbleArrayFilter } from "./scrobble.js";
import { SeriesSubscription, SeriesSubscriptionArrayFilter } from "./seriesSubscription.js";
import { Server, ServerArrayFilter } from "./server.js";
import { Token, TokenArrayFilter } from "./token.js";
import { TorrentClient, TorrentClientArrayFilter } from "./torrentClient.js";

const { Prisma, Role } = pkg;
registerEnumType(Role, {
  name: "Role",
});

registerEnumType(Prisma.UserScalarFieldEnum, {
  name: "UserScalarFieldEnum",
});

@InputType()
export class RoleEnumFilter extends EnumFilter(Role) {}

@InputType()
export class BaseUserFilterWhereInput extends FilterWhereInput {
  @Field({ nullable: true })
  username?: StringFilter;

  @Field({ nullable: true })
  email?: StringFilter;

  @Field({ nullable: true })
  plexId?: IntFilter;

  @Field({ nullable: true })
  thumb?: StringFilter;

  @Field({ nullable: true })
  authenticationChallenge?: StringFilter;

  @Field({ nullable: true })
  authenticationChallengeExpiresAt?: DateTimeFilter;

  @Field(() => RoleEnumFilter, { nullable: true })
  role?: RoleEnumFilter;
}

@InputType()
export class UserFilterWhereInput extends BaseUserFilterWhereInput {
  @Field(() => AuthenticatorArrayFilter, { nullable: true })
  authenticators?: AuthenticatorArrayFilter;

  @Field({ nullable: true })
  accounts?: LinkedAccountArrayFilter;

  @Field({ nullable: true })
  tokens?: TokenArrayFilter;

  @Field({ nullable: true })
  scrobbles?: ScrobbleArrayFilter;

  @Field({ nullable: true })
  servers?: ServerArrayFilter;

  @Field({ nullable: true })
  torrentClients?: TorrentClientArrayFilter;

  @Field({ nullable: true })
  seriesSubscriptions?: SeriesSubscriptionArrayFilter;
}

@InputType()
export class UserArrayFilter extends ArrayFilter(UserFilterWhereInput) {}

@InputType()
export class UserUniqueInput extends WhereUniqueInput {
  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  plexId?: number;
}

@InputType()
export class UserFindManyInput extends FindManyWithScopeInput {
  @Field(() => UserFilterWhereInput, { nullable: true })
  where?: UserFilterWhereInput;

  @Field(() => UserUniqueInput, { nullable: true })
  cursor?: UserUniqueInput;

  @Field(() => Prisma.UserScalarFieldEnum, { nullable: true })
  distinct?: PrismaType.UserScalarFieldEnum;
}

@ObjectType()
export class User {
  @Field(() => ID)
  id: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field()
  username: string;

  @Field()
  email: string;

  @Field()
  plexId: number;

  @Field()
  thumb: string;

  @Field()
  authenticationChallenge?: string;

  @Field()
  authenticationChallengeExpiresAt?: Date;

  @Field(() => Role)
  role: RoleType;

  @Field(() => [Authenticator])
  authenticators: Authenticator[];

  @Field(() => [LinkedAccount])
  accounts: LinkedAccount[];

  @Field(() => [Token])
  tokens: Token[];

  @Field(() => [Scrobble])
  scrobbles: Scrobble[];

  @Field(() => [Server])
  servers: Server[];

  @Field(() => [TorrentClient])
  torrentClients: TorrentClient[];

  @Field(() => [SeriesSubscription])
  seriesSubscriptions: SeriesSubscription[];
}

@ObjectType()
export class PublicUser {
  @Field()
  username: string;

  @Field()
  thumb: string;
}
