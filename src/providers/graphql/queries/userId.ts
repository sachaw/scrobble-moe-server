import { gql } from "graphql-request";

export interface UserIdResponse {
  Viewer: {
    id: number;
  };
}

export const USER_ID = gql`
  query Viewer {
    Viewer {
      id
    }
  }
`;
