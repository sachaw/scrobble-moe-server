import type { ScrobbleStatus as ScrobbleStatusType } from "@prisma/client";
import { ScrobbleStatus } from "@prisma/client";

import { redis } from "../lib/redis.js";
import { BaseProvider, ILibraryEntry } from "./base.js";
import {
  SAVE_MEDIA_LIST,
  SaveMediaListVariables,
} from "./graphql/mutations/SaveMediaListEntry.js";
import {
  MEDIA,
  MediaResponse,
  MediaVariables,
} from "./graphql/queries/media.js";
import {
  MEDIA_EPISODES,
  MediaEpisodesResponse,
  MediaEpisodesVariables,
} from "./graphql/queries/mediaEpisodes.js";
import {
  MEDIA_LIST,
  MediaListResponse,
  MediaListVariables,
} from "./graphql/queries/mediaList.js";
import { USER_ID, UserIdResponse } from "./graphql/queries/userId.js";

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

export class Anilist extends BaseProvider<"graphql"> {
  constructor(accessToken?: string, providerUserId?: string) {
    super("graphql", "https://graphql.anilist.co/", accessToken);

    if (providerUserId) {
      this.providerUserId = providerUserId;
    }

    if (accessToken) {
      this.setAccessToken(accessToken);
    }
  }

  public setAccessToken(accessToken: string): void {
    this.accessToken = accessToken;
    this.client.setHeader("authorization", `Bearer ${this.accessToken}`);
  }

  async getUserId(): Promise<string> {
    const rawData = await this.client.request<UserIdResponse>(USER_ID);

    return rawData.Viewer.id.toString();
  }

  async getEntry(id: number): Promise<ILibraryEntry | undefined> {
    const rawData = await this.client
      .request<MediaListResponse>(MEDIA_LIST, {
        userId: this.providerUserId ?? (await this.getUserId()),
        mediaId: id,
      })
      .catch(() => {
        return;
      });

    return Promise.resolve(
      rawData
        ? {
            mediaProviderId: rawData.MediaList.media.id,
            progress: rawData.MediaList.progress,
            title: rawData.MediaList.media.title.userPreferred,
            total: rawData.MediaList.media.episodes,
          }
        : undefined,
    );
  }

  async getAnimeInfo(ids: number[]): Promise<AniListData[]> {
    const aniListEntries: AniListData[] = [];
    const uncachedIds: number[] = [];

    await Promise.all(
      ids.map(async (id) => {
        const redisResult = await redis.get(id.toString());

        if (redisResult) {
          aniListEntries.push(JSON.parse(redisResult));
        } else {
          uncachedIds.push(id);
        }
      }),
    );

    const rawData = await this.client.request<MediaResponse>(MEDIA, {
      mediaIds: uncachedIds,
    });

    await Promise.all(
      rawData.Page.media.map(async (media) => {
        const aniListEntry: AniListData = {
          id: media.id,
          title: media.title.romaji,
          type: media.type,
          status: media.status,
          description: media.description,
          coverImage: media.coverImage.extraLarge,
          bannerImage: media.bannerImage,
          episodes: media.episodes,
        };
        await redis.set(media.id.toString(), JSON.stringify(aniListEntry)); //TODO: set cache expiry
        aniListEntries.push(aniListEntry);
      }),
    );

    return aniListEntries;
  }

  async getEpisodes(id: number): Promise<number> {
    const rawData = await this.client.request<MediaEpisodesResponse>(
      MEDIA_EPISODES,
      {
        mediaId: id,
      },
    );

    return rawData.Media.episodes;
  }

  async setProgress(
    id: number,
    episode: number,
    entry?: ILibraryEntry,
  ): Promise<ScrobbleStatusType> {
    const localEntry = entry ?? (await this.getEntry(id));

    if (localEntry && episode <= localEntry.progress) {
      return ScrobbleStatus.IGNORED;
    }

    const totalEpisodes = localEntry?.total ?? (await this.getEpisodes(id));

    return await this.client
      .request<MediaListResponse>(SAVE_MEDIA_LIST, {
        mediaId: id,
        progress: episode,
        status: episode === totalEpisodes ? "COMPLETED" : "CURRENT",
      })
      .then(() => {
        return ScrobbleStatus.TRACKED;
      })
      .catch(() => {
        return ScrobbleStatus.ERRORED;
      });
  }
}

export const anilist = new Anilist();
