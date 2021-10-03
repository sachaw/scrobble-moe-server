import "reflect-metadata";

import { Field, ID, InputType, ObjectType, registerEnumType } from "type-graphql";

import type {
  Prisma as PrismaType,
  TorrentClientApplication as TorrentClientApplicationType,
} from "@prisma/client";
import pkg from "@prisma/client";

import { ArrayFilter } from "../utils/types/ArrayFilter.js";
import { EnumFilter } from "../utils/types/EnumFilter.js";
import { StringFilter } from "../utils/types/StringFilter.js";
import { FilterWhereInput, FindManyWithScopeInput, WhereUniqueInput } from "./helperTypes.js";
import { BaseUserFilterWhereInput, User } from "./user.js";

const { Prisma, TorrentClientApplication } = pkg;
registerEnumType(TorrentClientApplication, {
  name: "TorrentClientApplication",
});

registerEnumType(Prisma.TorrentClientScalarFieldEnum, {
  name: "TorrentClientScalarFieldEnum",
});

@InputType()
export class TorrentClientApplicationEnumFilter extends EnumFilter(TorrentClientApplication) {}

@InputType()
export class BaseTorrentClientFilterWhereInput extends FilterWhereInput {
  @Field({ nullable: true })
  clientUrl?: StringFilter;

  @Field({ nullable: true })
  clientUsername?: StringFilter;

  @Field({ nullable: true })
  clientPassword?: StringFilter;
}

@InputType()
export class TorrentClientFilterWhereInput extends BaseTorrentClientFilterWhereInput {
  @Field(() => TorrentClientApplicationEnumFilter, { nullable: true })
  client?: TorrentClientApplicationEnumFilter;

  @Field(() => BaseUserFilterWhereInput, { nullable: true })
  user?: BaseUserFilterWhereInput;
}

@InputType()
export class TorrentClientArrayFilter extends ArrayFilter(BaseTorrentClientFilterWhereInput) {}

@InputType()
export class TorrentClientFindManyInput extends FindManyWithScopeInput {
  @Field(() => TorrentClientFilterWhereInput, { nullable: true })
  where?: TorrentClientFilterWhereInput;

  @Field(() => WhereUniqueInput, { nullable: true })
  cursor?: WhereUniqueInput;

  @Field(() => Prisma.TorrentClientScalarFieldEnum, { nullable: true })
  distinct?: PrismaType.TorrentClientScalarFieldEnum;
}

@ObjectType()
export class TorrentClient {
  @Field(() => ID)
  id: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field()
  clientUrl: string;

  @Field()
  clientUsername: string;

  @Field()
  clientPassword: string;

  @Field(() => TorrentClientApplication)
  client: TorrentClientApplicationType;

  @Field(() => User)
  user: User;
}
