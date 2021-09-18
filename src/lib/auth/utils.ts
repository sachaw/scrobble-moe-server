import { AuthenticationError } from "apollo-server";
import axios, { AxiosError } from "axios";

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
  const response = await axios
    .get("https://plex.tv/users/account.json", {
      headers: {
        "X-Plex-Token": token,
        Accept: "application/json",
      },
    })
    .catch((error: Error | AxiosError) => {
      if (axios.isAxiosError(error)) {
        switch (error.response?.status) {
          case 422:
            throw new AuthenticationError("Invalid Plex Token");
          default:
            throw new AuthenticationError("Unknown Error");
        }
      } else {
        throw new Error(error.message);
      }
    });

  return response.data as IPlexAccountResponse;
};
