export type {};

declare global {
  namespace nodeJs {
    interface ProcessEnv {
      DATABASE_URL: string;
      PULSE_API_KEY: string;
      REDIS_URL: string;
      PASETO_SECRET_KEY: string;
      PASETO_PUBLIC_KEY: string;
      PORT: string;
      RP_NAME: string;
      RP_ORIGIN: string;
      RP_ID: string;
      ANILIST_SECRET: string;
      ANILIST_ID: string;
      ANILIST_REDIRECT_URL: string;
      PLEX_CLIENT_IDENTIFIER: string;
    }
  }
}
