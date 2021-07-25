import axios from "axios";
import { xml2js } from "xml-js";

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

export const getPlexServers = async (token: string) => {
  const serversXML = await axios.get(`https://plex.tv/api/servers?X-Plex-Token=${token}`);
  return (xml2js(serversXML.data, { compact: true }) as any).MediaContainer.Server as PlexServer[];
};
