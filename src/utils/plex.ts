import axios from "axios";
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

export const getPlexServers = async (token: string): Promise<PlexServer[]> => {
  const serversXML = await axios.get(`https://plex.tv/api/servers?X-Plex-Token=${token}`);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const servers = (xml2js(serversXML.data, { compact: true }) as ElementCompact).MediaContainer
    .Server as PlexServer[] | PlexServer;

  return servers instanceof Array ? servers : [servers];
};
