import "reflect-metadata";

import { Field, ID, InputType, ObjectType, registerEnumType } from "type-graphql";

import { Prisma, Role } from "@prisma/client";

import { ArrayFilter } from "../utils/types/ArrayFilter";
import { DateTimeFilter } from "../utils/types/DateTimeFilter";
import { EnumFilter } from "../utils/types/EnumFilter";
import { IntFilter } from "../utils/types/IntFilter";
import { StringFilter } from "../utils/types/StringFilter";
import { Authenticator, AuthenticatorArrayFilter } from "./authenticator";
import { FilterWhereInput, FindManyWithScopeInput, WhereUniqueInput } from "./helperTypes";
import { LinkedAccount, LinkedAccountArrayFilter } from "./linkedAccount";
import { Scrobble, ScrobbleArrayFilter } from "./scrobble";
import { SeriesSubscription, SeriesSubscriptionArrayFilter } from "./seriesSubscription";
import { Server, ServerArrayFilter } from "./server";
import { Token, TokenArrayFilter } from "./token";
import { TorrentClient, TorrentClientArrayFilter } from "./torrentClient";

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
  username: StringFilter;

  @Field({ nullable: true })
  email: StringFilter;

  @Field({ nullable: true })
  plexId: IntFilter;

  @Field({ nullable: true })
  thumb: StringFilter;

  @Field({ nullable: true })
  authenticationChallenge: StringFilter;

  @Field({ nullable: true })
  authenticationChallengeExpiresAt: DateTimeFilter;

  @Field(() => RoleEnumFilter, { nullable: true })
  role: RoleEnumFilter;
}

@InputType()
export class UserFilterWhereInput extends BaseUserFilterWhereInput {
  @Field(() => AuthenticatorArrayFilter, { nullable: true })
  authenticators: AuthenticatorArrayFilter;

  @Field({ nullable: true })
  accounts: LinkedAccountArrayFilter;

  @Field({ nullable: true })
  tokens: TokenArrayFilter;

  @Field({ nullable: true })
  scrobbles: ScrobbleArrayFilter;

  @Field({ nullable: true })
  servers: ServerArrayFilter;

  @Field({ nullable: true })
  torrentClients: TorrentClientArrayFilter;

  @Field({ nullable: true })
  seriesSubscriptions: SeriesSubscriptionArrayFilter;
}

@InputType()
export class UserArrayFilter extends ArrayFilter(UserFilterWhereInput) {}

@InputType()
export class UserUniqueInput extends WhereUniqueInput {
  @Field({ nullable: true })
  email: string;

  @Field({ nullable: true })
  plexId: number;
}

@InputType()
export class UserFindManyInput extends FindManyWithScopeInput {
  @Field(() => UserFilterWhereInput, { nullable: true })
  where: UserFilterWhereInput;

  @Field(() => UserUniqueInput, { nullable: true })
  cursor: UserUniqueInput;

  @Field(() => Prisma.UserScalarFieldEnum, { nullable: true })
  distinct: Prisma.UserScalarFieldEnum;
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
  authenticationChallenge: string;

  @Field()
  authenticationChallengeExpiresAt: Date;

  @Field(() => Role)
  role: Role;

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
