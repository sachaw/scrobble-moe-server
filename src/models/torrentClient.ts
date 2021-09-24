import "reflect-metadata";

import { Field, ID, InputType, ObjectType, registerEnumType } from "type-graphql";

import { Prisma, TorrentClientApplication } from "@prisma/client";

import { ArrayFilter } from "../utils/types/ArrayFilter";
import { EnumFilter } from "../utils/types/EnumFilter";
import { StringFilter } from "../utils/types/StringFilter";
import { FilterWhereInput, FindManyWithScopeInput, WhereUniqueInput } from "./helperTypes";
import { BaseUserFilterWhereInput, User } from "./user";

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
  distinct?: Prisma.TorrentClientScalarFieldEnum;
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
  client: TorrentClientApplication;

  @Field(() => User)
  user: User;
}
