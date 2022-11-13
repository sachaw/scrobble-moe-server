import { createClient } from "redis";

import { loadEnv } from "./env.js";

loadEnv(); // @todo fix needing to load this here.

export const redis = createClient({
  url: process.env.REDIS_URL,
});

redis.on("error", (err) => console.error("Redis Client Error", err));

await redis.connect();
