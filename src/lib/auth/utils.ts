import got from "got";

import { AuthenticationError } from "@frontendmonster/graphql-utils";

export interface IPlexAccountResponse {
  user: {
    id: number;
    uuid: string;
    email: string;
    joined_at: string;
    username: string;
    title: string;
    thumb: string;
    hasPassword: boolean;
    authToken: string;
    authentication_token: string;
    subscription: {
      active: boolean;
      status: string;
      plan: string;
      features: string[];
    };
    roles: { roles: string[] };
  };
  entitlements: string[];
  confirmedAt: string;
  forumId: string | null;
}

export const getPlexAccount = async (token: string): Promise<IPlexAccountResponse> => {
  return await got
    .get("https://plex.tv/users/account.json", {
      headers: {
        "X-Plex-Token": token,
        Accept: "application/json",
      },
    })
    .json<IPlexAccountResponse>();
};
