import { gql } from "graphql-request";

export interface IMediaEpisodesResponse {
  Media: {
    episodes: number;
  };
}

export interface IMediaEpisodesVariables {
  mediaId: number;
}

export const MEDIA_EPISODES = gql`
  query MediaEpisodes($mediaId: Int) {
    Media(id: $mediaId) {
      episodes
    }
  }
`;
