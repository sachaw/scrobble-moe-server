import { Service } from "typedi";

import { QBittorrent } from "@ctrl/qbittorrent";
import { TorrentFilters } from "@ctrl/qbittorrent/dist/types";
import { TorrentSettings } from "@ctrl/shared-torrent";

@Service()
export class TorrentManager {
  constructor(connectionParams?: Partial<TorrentSettings>) {
    this.client = new QBittorrent(connectionParams);
  }

  public client: QBittorrent;

  public setConnection(connectionParams: Partial<TorrentSettings>) {
    this.client = new QBittorrent(connectionParams);
  }

  public async addEpisode(magnet: string, name: string, savepath: string): Promise<boolean> {
    return this.client.addMagnet(magnet, {
      category: "Airing",
      savepath,
      rename: name,
    });
  }

  public async getManagedTorrents(filter?: TorrentFilters) {
    return await this.client.listTorrents(undefined, filter, "Airing");
  }

  public async checkConnectivity() {
    return await this.client.login();
  }
}
