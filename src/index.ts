import "reflect-metadata";

import { ApolloServer } from "apollo-server";
import { buildSchema } from "type-graphql";

import { MetadataService } from "@simplewebauthn/server";

import { AuthResolver } from "./lib/auth/authResolver";
import context from "./lib/context";
import { loadEnv } from "./lib/env";
import sentry from "./lib/sentry";
import { WebhookResolver } from "./lib/webhook/webhookResolver";
import { AuthenticatorResolver } from "./models/authenticatorResolver";
import { EncoderResolver } from "./models/encoderResolver";
import { LinkedAccountResolver } from "./models/linkedAccountResolver";
import { ScrobbleResolver } from "./models/scrobbleResolver";
import { SeriesSubscriptionResolver } from "./models/seriesSubscriptionResolver";
import { ServerResolver } from "./models/serverResolver";
import { TorrentClientResolver } from "./models/torrentClientResolver";
import { UserResolver } from "./models/userResolver";
import sentryPlugin from "./plugins/sentry";
import sentryPerformancePlugin from "./plugins/sentryPerformance";
import { authCheck } from "./utils/auth";

loadEnv();
sentry();
void MetadataService.initialize().then(() => {
  console.log("🔐 MetadataService initialized");
});

const app = async (): Promise<void> => {
  const schema = await buildSchema({
    resolvers: [
      AuthResolver,
      AuthenticatorResolver,
      EncoderResolver,
      LinkedAccountResolver,
      ScrobbleResolver,
      SeriesSubscriptionResolver,
      ServerResolver,
      // sessionResolver
      // tokenResolver
      TorrentClientResolver,
      UserResolver,
      WebhookResolver,
    ],
    authChecker: authCheck,
  });

  void new ApolloServer({
    schema,
    context: context,
    cors: {
      origin: "*",
    },
    plugins: [sentryPlugin, sentryPerformancePlugin],
  }).listen({ port: 4000 }, () => console.log(`🚀 Server ready`));
};

void app();
