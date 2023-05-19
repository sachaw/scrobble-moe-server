import { gql } from "graphql-request";

export interface MediaResponse {
  Page: {
    media: {
      id: number;
      title: {
        romaji: string;
      };
      type: "ANIME" | "MANGA";
      status:
        | "FINISHED"
        | "RELEASING"
        | "NOT_YET_RELEASED"
        | "CANCELLED"
        | "HIATUS";
      description: string;
      coverImage: {
        extraLarge: string;
      };
      bannerImage?: string;
      episodes: number;
    }[];
  };
}

export interface MediaVariables {
  mediaIds: number[];
}

export const MEDIA = gql`
  query Page($mediaIds: [Int]) {
    Page {
      media(id_in: $mediaIds) {
        id
        title {
          romaji
        }
        type
        status
        description
        coverImage {
          extraLarge
        }
        bannerImage
        episodes
      }
    }
  }
`;
