import { Code, ConnectError } from "@bufbuild/connect";
import { ElementCompact, xml2js } from "xml-js";

export interface PlexServer {
  _attributes: {
    accessToken: string;
    name: string;
    address: string;
    port: string;
    version: string;
    scheme: string;
    host: string;
    localAddresses: string;
    machineIdentifier: string;
    createdAt: string;
    updatedAt: string;
    owned: string;
    synced: string;
  };
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

export const getPlexServers = async (token: string): Promise<PlexServer[]> => {
  const response = await fetch(
    `https://plex.tv/api/servers?X-Plex-Token=${token}`,
  );

  const servers = (
    xml2js(await response.text(), { compact: true }) as ElementCompact
  ).MediaContainer.Server as PlexServer[] | PlexServer;

  return servers instanceof Array ? servers : [servers];
};

export const getPlexAccount = async (plexToken: string) => {
  const response = await fetch("https://plex.tv/users/account.json", {
    headers: {
      "X-Plex-Token": plexToken,
      Accept: "application/json",
    },
  });
  return (await response.json().catch((err: Error) => {
    throw new ConnectError(err.message, Code.Internal);
  })) as PlexAccountResponse;
};
