import * as Sentry from "@sentry/node";

const sentry = () => {
  return Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV ?? "development",
    tracesSampleRate: 1.0,
    integrations: [new Sentry.Integrations.Http({ tracing: true })],
  });
};

export default sentry;
