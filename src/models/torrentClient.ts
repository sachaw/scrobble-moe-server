import "reflect-metadata";

import { Field, ID, InputType, ObjectType, registerEnumType } from "type-graphql";

import { Prisma, TorrentClientApplication } from "@prisma/client";

import {
  FilterWhereInput,
  FindManyWithScopeInput,
  StringFilter,
  WhereUniqueInput,
} from "./helperTypes";
import { User, UserFilterWhereInput } from "./user";

registerEnumType(TorrentClientApplication, {
  name: "TorrentClientApplication",
});

registerEnumType(Prisma.TorrentClientScalarFieldEnum, {
  name: "TorrentClientScalarFieldEnum",
});

@InputType()
export class TorrentClientFilterWhereInput extends FilterWhereInput {
  @Field({ nullable: true })
  clientUrl: StringFilter;

  @Field({ nullable: true })
  clientUsername: StringFilter;

  @Field({ nullable: true })
  clientPassword: StringFilter;

  @Field(() => TorrentClientApplication, { nullable: true })
  client: TorrentClientApplication;

  @Field(() => UserFilterWhereInput, { nullable: true })
  user: UserFilterWhereInput;
}

@InputType()
export class TorrentClientFindManyInput extends FindManyWithScopeInput {
  @Field(() => TorrentClientFilterWhereInput, { nullable: true })
  where: TorrentClientFilterWhereInput;

  @Field(() => WhereUniqueInput, { nullable: true })
  cursor: WhereUniqueInput;

  @Field(() => Prisma.TorrentClientScalarFieldEnum, { nullable: true })
  distinct: Prisma.TorrentClientScalarFieldEnum;
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
