import { Code, ConnectError } from "@connectrpc/connect";

export interface PlexResource {
  name: string;
  product: string;
  productVersion: string;
  platform: string;
  platformVersion: string;
  device: string;
  clientIdentifier: string;
  createdAt: string;
  lastSeenAt: string;
  provides: string;
  ownerId?: number;
  sourceTitle?: string;
  publicAddress: string;
  accessToken?: string;
  owned: boolean;
  home: boolean;
  synced: boolean;
  relay: boolean;
  presence: boolean;
  httpsRequired: boolean;
  publicAddressMatches: boolean;
  dnsRebindingProtection?: boolean;
  natLoopbackSupported?: boolean;
  connections: Connection[];
}

export interface Connection {
  protocol: string;
  address: string;
  port: number;
  uri: string;
  local: boolean;
  relay: boolean;
  IPv6: boolean;
}

interface PlexAccountResponse {
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

export const getPlexServers = async (
  token: string,
): Promise<PlexResource[]> => {
  const url = new URL("https://clients.plex.tv/api/v2/resources");
  url.searchParams.append("X-Plex-Token", token);
  url.searchParams.append(
    "X-Plex-Client-Identifier",
    process.env.PLEX_CLIENT_IDENTIFIER,
  );

  return (await fetch(url, {
    headers: {
      Accept: "application/json",
    },
  }).then((res) => res.json())) as PlexResource[];
};

export const getPlexAccount = async (plexToken: string) => {
  const response = await fetch("https://plex.tv/users/account.json", {
    headers: {
      "X-Plex-Token": plexToken,
      Accept: "application/json",
    },
  });
  const resJSON = await response.json().catch((err: Error) => {
    throw new ConnectError(err.message, Code.Internal);
  });
  if (resJSON.error) {
    throw new ConnectError(resJSON.error, Code.Internal);
  }
  return resJSON as PlexAccountResponse;
};
