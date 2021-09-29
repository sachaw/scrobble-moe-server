import { gql } from "graphql-request";

export interface ISaveMediaListVariables {
  mediaId: number;
  progress: number;
  status: "CURRENT" | "PLANNING" | "COMPLETED" | "DROPPED" | "PAUSED" | "REPEATING";
}

export const SAVE_MEDIA_LIST = gql`
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
