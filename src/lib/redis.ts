import { createClient } from "redis";

export const redis = createClient({ url: process.env.REDIS_URL });
void redis.connect();
// export const redis = await rediClients.connect();
