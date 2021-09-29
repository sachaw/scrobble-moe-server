import { gql } from "graphql-request";

export interface IUserIdResponse {
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
