import axios from "axios";
import { Cron, CronController } from "cron-decorators";
import Parser from "rss-parser";

import { Logtail } from "@logtail/node";

import { env } from "../lib/env.js";
import { prisma } from "../lib/prisma.js";
import { redis } from "../lib/redis.js";
import { RssItem } from "../models/encoder.js";

@CronController("jobs")
export class CacheRssFeeds {
  private logger: Logtail;

  constructor() {
    this.logger = new Logtail(env.LOGTAIL_TOKEN);
  }

  @Cron("Refresh Cached RSS feeds.", "*/5 * * * *")
  public async handle(): Promise<void> {
    this.logger.info("test feed");
    await axios.get(env.JOB_HEARTBEAT_RSS);
    const encoders = await prisma.encoder.findMany();
    for (const encoder of encoders) {
      const parser = new Parser<unknown, RssItem>();
      await axios
        .get<string>(encoder.rssURL)
        .then(async (rss) => {
          const feed = await parser.parseString(rss.data).catch((e) => {
            this.logger.error(e);
          });

          if (feed) {
            const providerRegex = new RegExp(encoder.matchRegex);
            const filteredFeed = feed.items.filter((feedItem) =>
              providerRegex.test(feedItem.title)
            );

            redis.set(encoder.rssURL, JSON.stringify(filteredFeed));
          }
        })
        .catch((e) => null);
    }
  }
}
