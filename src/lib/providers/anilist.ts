import { ScrobbleStatus } from "@prisma/client";

import { AniListData } from "../../models/scrobble";
import { BaseProvider, ILibraryEntry } from "./base";
import { ISaveMediaListVariables, SAVE_MEDIA_LIST } from "./graphql/mutations/SaveMediaListEntry";
import { IMediaResponse, IMediaVariables, MEDIA } from "./graphql/queries/media";
import {
  IMediaEpisodesResponse,
  IMediaEpisodesVariables,
  MEDIA_EPISODES,
} from "./graphql/queries/mediaEpisodes";
import { IMediaListResponse, IMediaListVariables, MEDIA_LIST } from "./graphql/queries/mediaList";
import { IUserIdResponse, USER_ID } from "./graphql/queries/userId";

export class Anilist extends BaseProvider<"graphql"> {
  constructor(accessToken?: string, providerUserId?: string) {
    super("graphql", "https://graphql.anilist.co/", accessToken);

    if (providerUserId) {
      this.providerUserId = providerUserId;
    }

    if (accessToken) {
      this.client.setHeader("authorization", `Bearer ${this.accessToken}`);
    }
  }

  private requestCache: { id: number; payload: AniListData }[] = [];

  async getUserId(): Promise<string> {
    const rawData = await this.client.request<IUserIdResponse>(USER_ID);

    return rawData.Viewer.id.toString();
  }

  async getEntry(id: number): Promise<ILibraryEntry | undefined> {
    const rawData = await this.client
      .request<IMediaListResponse, IMediaListVariables>(MEDIA_LIST, {
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
        : undefined
    );
  }

  async getAnimeInfo(ids: number[]): Promise<AniListData[]> {
    const unCached = ids.filter((id) => !this.requestCache.find((entry) => entry.id === id));

    const rawData = await this.client.request<IMediaResponse, IMediaVariables>(MEDIA, {
      mediaIds: unCached,
    });

    rawData.Page.media.map((media) => {
      this.requestCache.push({
        id: media.id,
        payload: {
          id: media.id,
          title: media.title.romaji,
          type: media.type,
          status: media.status,
          description: media.description,
          coverImage: media.coverImage.extraLarge,
          bannerImage: media.bannerImage,
          episodes: media.episodes,
        },
      });
    });

    return this.requestCache
      .filter((entry) => ids.includes(entry.id))
      .map((entry) => entry.payload);
  }

  async getEpisodes(id: number): Promise<number> {
    const rawData = await this.client.request<IMediaEpisodesResponse, IMediaEpisodesVariables>(
      MEDIA_EPISODES,
      {
        mediaId: id,
      }
    );

    return rawData.Media.episodes;
  }

  async setProgress(id: number, episode: number, entry?: ILibraryEntry): Promise<ScrobbleStatus> {
    const localEntry = entry ?? (await this.getEntry(id));

    if (localEntry && episode <= localEntry.progress) {
      return ScrobbleStatus.IGNORED;
    }

    const totalEpisodes = localEntry?.total ?? (await this.getEpisodes(id));

    return await this.client
      .request<IMediaListResponse, ISaveMediaListVariables>(SAVE_MEDIA_LIST, {
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
