import { gql } from "graphql-request";

import { ScrobbleStatus } from "@prisma/client";

import { BaseProvider, ILibraryEntry } from "./base";

const MEDIA_LIST_QUERY = gql`
  query MediaList($userId: Int, $mediaId: Int) {
    MediaList(userId: $userId, mediaId: $mediaId) {
      media {
        id
        title {
          userPreferred
        }
        episodes
      }
      progress
    }
  }
`;

const MEDIA_EPISODES_QUERY = gql`
  query MediaEpisodes($mediaId: Int) {
    Media(id: $mediaId) {
      episodes
    }
  }
`;

const MEDIA_LIST_MUTATION = gql`
  mutation SaveMediaListEntry($mediaId: Int, $progress: Int, $status: MediaListStatus) {
    SaveMediaListEntry(mediaId: $mediaId, progress: $progress, status: $status) {
      media {
        id
        title {
          userPreferred
        }
        episodes
      }
      progress
    }
  }
`;

const USER_ID_QUERY = gql`
  query Viewer {
    Viewer {
      id
    }
  }
`;

interface IUserIdResponse {
  Viewer: {
    id: number;
  };
}

interface IMediaEpisodesResponse {
  Media: {
    episodes: number;
  };
}

interface IMediaEpisodesVariables {
  mediaId: number;
}

interface IMediaListResponse {
  MediaList: {
    media: {
      id: number;
      title: {
        userPreferred: string;
      };
      episodes: number;
    };
    progress: number;
  };
}

interface IMediaListVariables {
  userId: string;
  mediaId: number;
}

export class Anilist extends BaseProvider<"graphql"> {
  constructor(accessToken: string, providerUserId?: string) {
    super("graphql", "https://graphql.anilist.co/", accessToken);

    if (providerUserId) {
      this.providerUserId = providerUserId;
    }

    this.client.setHeader("authorization", `Bearer ${this.accessToken}`);
  }

  async getUserId(): Promise<string> {
    const rawData = await this.client.request<IUserIdResponse>(USER_ID_QUERY);

    return rawData.Viewer.id.toString();
  }

  async getEntry(id: number): Promise<ILibraryEntry | undefined> {
    const rawData = await this.client
      .request<IMediaListResponse, IMediaListVariables>(MEDIA_LIST_QUERY, {
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

  async getEpisodes(id: number): Promise<number> {
    const rawData: IMediaEpisodesResponse = await this.client.request<
      IMediaEpisodesResponse,
      IMediaEpisodesVariables
    >(MEDIA_EPISODES_QUERY, {
      mediaId: id,
    });

    return rawData.Media.episodes;
  }

  async setProgress(id: number, episode: number, entry?: ILibraryEntry): Promise<ScrobbleStatus> {
    const localEntry = entry ?? (await this.getEntry(id));

    if (localEntry && episode <= localEntry.progress) {
      return ScrobbleStatus.IGNORED;
    }

    const totalEpisodes = localEntry?.total ?? (await this.getEpisodes(id));

    return await this.client
      .request(MEDIA_LIST_MUTATION, {
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
