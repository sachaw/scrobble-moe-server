import { gql } from "graphql-request";

export interface MediaEpisodesResponse {
  Media: {
    episodes: number;
  };
}

export interface MediaEpisodesVariables {
  mediaId: number;
}

export const MEDIA_EPISODES = gql`
  query MediaEpisodes($mediaId: Int) {
    Media(id: $mediaId) {
      episodes
    }
  }
`;
