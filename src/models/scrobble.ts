import "reflect-metadata";

import { Field, ID, InputType, ObjectType, registerEnumType } from "type-graphql";

import { Prisma } from "@prisma/client";

import { ArrayFilter } from "../utils/types/ArrayFilter";
import { IntFilter } from "../utils/types/IntFilter";
import { StringFilter } from "../utils/types/StringFilter";
import { FilterWhereInput, FindManyWithScopeInput, WhereUniqueInput } from "./helperTypes";
import { LinkedAccount, LinkedAccountArrayFilter } from "./linkedAccount";
import {
  ScrobbleProviderStatus,
  ScrobbleProviderStatusArrayFilter,
} from "./scrobbleProviderStatus";
import { BaseServerFilterWhereInput, Server } from "./server";
import { BaseUserFilterWhereInput, PublicUser, User } from "./user";

registerEnumType(Prisma.ScrobbleScalarFieldEnum, {
  name: "ScrobbleScalarFieldEnum",
});

@InputType()
export class BaseScrobbleFilterWhereInput extends FilterWhereInput {
  @Field({ nullable: true })
  providerMediaId?: StringFilter;

  @Field({ nullable: true })
  episode?: IntFilter;
}

@InputType()
export class ScrobbleFilterWhereInput extends BaseScrobbleFilterWhereInput {
  @Field(() => BaseUserFilterWhereInput, { nullable: true })
  user?: BaseUserFilterWhereInput;

  @Field(() => BaseServerFilterWhereInput, { nullable: true })
  server?: BaseServerFilterWhereInput;

  @Field(() => LinkedAccountArrayFilter, { nullable: true })
  accounts?: LinkedAccountArrayFilter;

  @Field(() => ScrobbleProviderStatusArrayFilter, { nullable: true })
  status?: ScrobbleProviderStatusArrayFilter;
}

@InputType()
export class ScrobbleArrayFilter extends ArrayFilter(BaseScrobbleFilterWhereInput) {}

@InputType()
export class ScrobbleFindManyInput extends FindManyWithScopeInput {
  @Field(() => ScrobbleFilterWhereInput, { nullable: true })
  where?: ScrobbleFilterWhereInput;

  @Field(() => WhereUniqueInput, { nullable: true })
  cursor?: WhereUniqueInput;

  @Field(() => Prisma.ScrobbleScalarFieldEnum, { nullable: true })
  distinct?: Prisma.ScrobbleScalarFieldEnum;
}

@ObjectType()
export class Scrobble {
  @Field(() => ID)
  id: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

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

  @Field(() => [ScrobbleProviderStatus])
  status: ScrobbleProviderStatus[];
}

@ObjectType()
export class AniListData {
  @Field()
  id: number;

  @Field()
  title: string;

  @Field()
  type: "ANIME" | "MANGA";

  @Field()
  status: "FINISHED" | "RELEASING" | "NOT_YET_RELEASED" | "CANCELLED" | "HIATUS";

  @Field()
  description: string;

  @Field()
  coverImage: string;

  @Field({ nullable: true })
  bannerImage?: string;

  @Field()
  episodes: number;
}

@ObjectType()
export class ScrobbleWithoutRelations {
  @Field(() => ID)
  id: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field()
  providerMediaId: string;

  @Field()
  episode: number;
}

@ObjectType()
export class ScrobbleFeed {
  @Field()
  providerMediaId: string;

  @Field(() => PublicUser)
  user: PublicUser;

  @Field(() => AniListData, { nullable: true })
  anilistData?: AniListData;

  @Field()
  startEpisode: number;

  @Field()
  endEpisode: number;
}
