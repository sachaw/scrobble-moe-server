import { Service } from "typedi";

import { QBittorrent, TorrentFilters } from "@ctrl/qbittorrent";
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
    return await this.client.listTorrents({
      filter,
      category: "Airing",
    });
  }

  public async checkConnectivity() {
    return await this.client.login();
  }
}
