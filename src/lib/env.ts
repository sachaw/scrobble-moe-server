import { EnvType, load } from "ts-dotenv";

export type Env = EnvType<typeof schema>;

export const schema = {
  DATABASE_URL: String,
  JWT_SECRET: String,
  SENTRY_DSN: String,
  ANILIST_ID: Number,
  ANILIST_SECRET: String,
  ANILIST_REDIRECT_URL: String,
  RP_ID: String,
  RP_NAME: String,
  RP_ORIGIN: String,
};

export let env: Env;

export function loadEnv(): void {
  env = load(schema);
}
