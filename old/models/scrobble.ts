import { LinkedAccount, ScrobbleProviderStatus, User } from "@prisma/client";
import { Server } from "http";

export class Scrobble {
  providerMediaId: string;
  episode: number;
  user: User;
  server: Server;
  accounts: LinkedAccount[];
  status: ScrobbleProviderStatus[];
  anilistData?: AniListData;
}

export class AniListData {
  id: number;
  title: string;
  type: "ANIME" | "MANGA";
  status:
    | "FINISHED"
    | "RELEASING"
    | "NOT_YET_RELEASED"
    | "CANCELLED"
    | "HIATUS";
  description: string;
  coverImage: string;
  bannerImage?: string;
  episodes: number;
}

export class ScrobbleFeed {
  providerMediaId: string;
  // user: PublicUser;
  anilistData?: AniListData;
  startEpisode: number;
  endEpisode: number;
}
