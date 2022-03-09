import Redis from "ioredis";

import { env, loadEnv } from "./env.js";

// import { logger } from "./logger.js";

loadEnv(); // @todo fix needing to load this here.

export const redis = new Redis(env.REDIS_URL);

// redis.on("error", (error) => {
//   logger.error(error);
// });
