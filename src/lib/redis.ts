import { createClient } from "redis";
import { client, secrets } from "./infisical.js";

export const redis = createClient({
  url: secrets.REDIS_URL,
});

redis.on("error", (err) => console.error("Redis Client Error", err));

await redis.connect();
