import "reflect-metadata";

import { ApolloServer } from "apollo-server";
import { buildSchema } from "type-graphql";

import { MetadataService } from "@simplewebauthn/server";

import { AuthResolver } from "./lib/auth/authResolver";
import { context } from "./lib/context";
import { loadEnv } from "./lib/env";
import sentry from "./lib/sentry";
import { WebhookResolver } from "./lib/webhook/webhookResolver";
import { AuthenticatorResolver } from "./models/authenticatorResolver";
import { EncoderResolver } from "./models/encoderResolver";
import { LinkedAccountResolver } from "./models/linkedAccountResolver";
import { ScrobbleResolver } from "./models/scrobbleResolver";
import { SeriesSubscriptionResolver } from "./models/seriesSubscriptionResolver";
import { ServerResolver } from "./models/serverResolver";
import { TokenResolver } from "./models/tokenResolver";
import { TorrentClientResolver } from "./models/torrentClientResolver";
import { UserResolver } from "./models/userResolver";
import sentryPlugin from "./plugins/sentry";
import sentryPerformancePlugin from "./plugins/sentryPerformance";
import tokenManagementPlugin from "./plugins/tokenManagement";
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
      TokenResolver,
      TorrentClientResolver,
      UserResolver,
      WebhookResolver,
    ],
    authChecker: authCheck,
    dateScalarMode: "isoDate",
    scalarsMap: [],
  });

  const server = new ApolloServer({
    schema,
    context,
    cors: {
      origin: [
        "https://studio.apollographql.com",
        process.env.NODE_ENV === "production" ? "https://scrobble.moe" : "http://localhost:3000",
      ],
      credentials: true,
    },
    plugins: [sentryPlugin, sentryPerformancePlugin, tokenManagementPlugin],
    introspection: true,
  });

  void server.listen({ port: 4000 }, () => console.log(`🚀 Server ready`));
};

void app();
