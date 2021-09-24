import "reflect-metadata";

import { Field, ID, InputType, ObjectType, registerEnumType } from "type-graphql";

import { Prisma } from "@prisma/client";

import { ArrayFilter } from "../utils/types/ArrayFilter";
import { StringFilter } from "../utils/types/StringFilter";
import { FilterWhereInput, FindManyWithScopeInput, WhereUniqueInput } from "./helperTypes";
import { Scrobble, ScrobbleArrayFilter } from "./scrobble";
import { User, UserArrayFilter } from "./user";

registerEnumType(Prisma.ServerScalarFieldEnum, {
  name: "ServerScalarFieldEnum",
});

@InputType()
export class BaseServerFilterWhereInput extends FilterWhereInput {
  @Field({ nullable: true })
  uuid?: StringFilter;

  @Field({ nullable: true })
  secret?: StringFilter;

  @Field({ nullable: true })
  name?: StringFilter;
}

@InputType()
export class ServerFilterWhereInput extends BaseServerFilterWhereInput {
  @Field(() => UserArrayFilter, { nullable: true })
  users?: UserArrayFilter;

  @Field(() => ScrobbleArrayFilter, { nullable: true })
  scrobbles?: ScrobbleArrayFilter;
}

@InputType()
export class ServerArrayFilter extends ArrayFilter(BaseServerFilterWhereInput) {}

@InputType()
export class ServerUniqueInput extends WhereUniqueInput {
  @Field({ nullable: true })
  uuid?: string;

  @Field({ nullable: true })
  secret?: string;
}

@InputType()
export class ServerFindManyInput extends FindManyWithScopeInput {
  @Field(() => ServerFilterWhereInput, { nullable: true })
  where?: ServerFilterWhereInput;

  @Field(() => ServerUniqueInput, { nullable: true })
  cursor?: ServerUniqueInput;

  @Field(() => Prisma.ServerScalarFieldEnum, { nullable: true })
  distinct?: Prisma.ServerScalarFieldEnum;
}

@ObjectType()
export class Server {
  @Field(() => ID)
  id: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field()
  uuid: string;

  @Field()
  secret: string;

  @Field()
  name: string;

  @Field(() => [User])
  users: User[];

  @Field(() => [Scrobble])
  scrobbles: Scrobble[];
}

@InputType()
export class LinkServerInput {
  @Field()
  machineIdentifier: string;
}

@ObjectType()
export class ServerResult {
  @Field()
  name: string;

  @Field()
  address: string;

  @Field()
  port: number;

  @Field()
  version: string;

  @Field()
  scheme: string;

  @Field()
  host: string;

  @Field()
  localAddresses: string;

  @Field()
  machineIdentifier: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field()
  owned: boolean;

  @Field()
  synced: boolean;
}
