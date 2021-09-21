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

interface IMEDIA_LIST_QUERY {
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

export class Anilist extends BaseProvider<"graphql"> {
  constructor(providerUserId: string, accessToken: string) {
    super("graphql", "https://graphql.anilist.co/", providerUserId, accessToken);

    this.client.setHeader("authorization", `Bearer ${this.accessToken}`);
  }

  async getEntry(id: number): Promise<ILibraryEntry> {
    const rawData: Promise<IMEDIA_LIST_QUERY> = this.client.request(MEDIA_LIST_QUERY, {
      userId: this.providerUserId,
      mediaId: id,
    });

    return Promise.resolve({
      mediaProviderId: (await rawData).MediaList.media.id,
      progress: (await rawData).MediaList.progress,
      title: (await rawData).MediaList.media.title.userPreferred,
      total: (await rawData).MediaList.media.episodes,
    });
  }

  async setProgress(id: number, episode: number, entry?: ILibraryEntry): Promise<ScrobbleStatus> {
    const localEntry = entry ?? (await this.getEntry(id));

    if (episode > localEntry.progress) {
      this.client
        .request(MEDIA_LIST_MUTATION, {
          mediaId: id,
          progress: episode,
          status: episode === localEntry.total ? "COMPLETED" : "CURRENT",
        })
        .then(() => {
          return ScrobbleStatus.TRACKED;
        })
        .catch(() => {
          return ScrobbleStatus.ERRORED;
        });
    }

    return ScrobbleStatus.IGNORED;
  }
}
