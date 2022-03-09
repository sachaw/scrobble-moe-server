import "reflect-metadata";

import { Field, InputType, ObjectType, registerEnumType } from "type-graphql";

import { TorrentState } from "@ctrl/qbittorrent";
import type { Prisma as PrismaType } from "@prisma/client";
import pkg from "@prisma/client";

import { StringFilter } from "../utils/types/StringFilter.js";
import {
  BasePrismaModel,
  FilterWhereInput,
  FindManyWithScopeInput,
  WhereUniqueInput,
} from "./helperTypes.js";
import { BaseUserFilterWhereInput, User } from "./user.js";

const { Prisma } = pkg;

// export enum TorrentState {
//   Error = "error",
//   PausedUP = "pausedUP",
//   PausedDL = "pausedDL",
//   QueuedUP = "queuedUP",
//   QueuedDL = "queuedDL",
//   Uploading = "uploading",
//   StalledUP = "stalledUP",
//   CheckingUP = "checkingUP",
//   CheckingDL = "checkingDL",
//   Downloading = "downloading",
//   StalledDL = "stalledDL",
//   ForcedDL = "forcedDL",
//   ForcedUP = "forcedUP",
//   MetaDL = "metaDL",
//   Allocating = "allocating",
//   QueuedForChecking = "queuedForChecking",
//   CheckingResumeData = "checkingResumeData",
//   Moving = "moving",
//   Unknown = "unknown",
//   MissingFiles = "missingFiles",
// }

registerEnumType(Prisma.TorrentClientScalarFieldEnum, {
  name: "TorrentClientScalarFieldEnum",
});

registerEnumType(TorrentState, {
  name: "TorrentState",
});

@ObjectType()
export class Torrent {
  @Field()
  name: string;

  @Field()
  hash: string;

  @Field()
  magnet_uri: string;

  @Field()
  added_on: number;

  @Field()
  size: number;

  @Field()
  progress: number;

  @Field()
  dlspeed: number;

  @Field()
  upspeed: number;

  @Field()
  priority: number;

  @Field()
  num_seeds: number;

  @Field()
  num_complete: number;

  @Field()
  num_leechs: number;

  @Field()
  num_incomplete: number;

  @Field()
  ratio: number;

  @Field()
  eta: number;

  @Field(() => TorrentState)
  state: TorrentState;

  @Field()
  seq_dl: boolean;

  @Field()
  f_l_piece_prio: boolean;

  @Field()
  completion_on: number;

  @Field()
  tracker: string;

  @Field()
  dl_limit: number;

  @Field()
  up_limit: number;

  @Field()
  downloaded: number;

  @Field()
  uploaded: number;

  @Field()
  downloaded_session: number;

  @Field()
  uploaded_session: number;

  @Field()
  amount_left: number;

  @Field()
  save_path: string;

  @Field()
  completed: number;

  @Field()
  max_ratio: number;

  @Field()
  max_seeding_time: number;

  @Field()
  ratio_limit: number;

  @Field()
  seeding_time_limit: number;

  @Field()
  seen_complete: number;

  @Field()
  last_activity: number;

  @Field()
  total_size: number;

  @Field()
  time_active: number;

  @Field()
  category: string;
}

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
  @Field(() => BaseUserFilterWhereInput, { nullable: true })
  user?: BaseUserFilterWhereInput;
}

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
export class TorrentClient extends BasePrismaModel {
  @Field()
  clientUrl: string;

  @Field()
  clientUsername: string;

  @Field()
  clientPassword: string;

  @Field(() => User)
  user: User;

  @Field()
  reachable: boolean;

  @Field(() => [Torrent])
  torrents: Torrent[];
}

@InputType()
export class AddTorrentClientInput {
  @Field()
  clientUrl: string;

  @Field()
  clientUsername: string;

  @Field()
  clientPassword: string;
}
