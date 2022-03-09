import { registerController } from "cron-decorators";

import { CacheRssFeeds } from "../jobs/cacheRssFeeds.js";

export const initializeJobs = (): void => {
  registerController([CacheRssFeeds]);
};
