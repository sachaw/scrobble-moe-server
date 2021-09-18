import "reflect-metadata";

import { Field, ID, InputType, ObjectType, registerEnumType } from "type-graphql";

import { Prisma, ScrobbleStatus } from "@prisma/client";

import {
  FilterWhereInput,
  FindManyWithScopeInput,
  IntFilter,
  StringFilter,
  WhereUniqueInput,
} from "./helperTypes";
import { LinkedAccount } from "./linkedAccount";
import { Server } from "./server";
import { User, UserFilterWhereInput } from "./user";

registerEnumType(ScrobbleStatus, {
  name: "ScrobbleStatus",
});

registerEnumType(Prisma.ScrobbleScalarFieldEnum, {
  name: "ScrobbleScalarFieldEnum",
});

@InputType()
export class ScrobbleFilterWhereInput extends FilterWhereInput {
  @Field(() => ScrobbleStatus, { nullable: true })
  status: ScrobbleStatus;

  @Field({ nullable: true })
  providerMediaId: StringFilter;

  @Field({ nullable: true })
  episode: IntFilter;

  @Field(() => UserFilterWhereInput, { nullable: true })
  user: UserFilterWhereInput;

  /**
   * @todo implement
   */
  // @Field(() => ServerWhereInput, { nullable: true })
  // server: ServerWhereInput;

  /**
   * @todo implement
   */
  // accounts
}

@InputType()
export class ScrobbleFindManyInput extends FindManyWithScopeInput {
  @Field(() => ScrobbleFilterWhereInput, { nullable: true })
  where: ScrobbleFilterWhereInput;

  @Field(() => WhereUniqueInput, { nullable: true })
  cursor: WhereUniqueInput;

  @Field(() => Prisma.ScrobbleScalarFieldEnum, { nullable: true })
  distinct: Prisma.ScrobbleScalarFieldEnum;
}

@ObjectType()
export class Scrobble {
  @Field(() => ID)
  id: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => ScrobbleStatus)
  status: ScrobbleStatus;

  @Field()
  providerMediaId: string;

  @Field()
  episode: number;

  @Field(() => User)
  user: User;

  @Field(() => Server)
  server: Server;

  @Field(() => [LinkedAccount])
  accounts: LinkedAccount[];
}
