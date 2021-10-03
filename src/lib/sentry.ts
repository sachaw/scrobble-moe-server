import * as Sentry from "@sentry/node";

import { env } from "./env.js";

const sentry = (): void => {
  return Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: process.env.NODE_ENV ?? "development",
    tracesSampleRate: 1.0,
    integrations: [new Sentry.Integrations.Http({ tracing: true })],
  });
};

export default sentry;
