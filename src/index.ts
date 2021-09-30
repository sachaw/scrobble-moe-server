import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { getGraphQLParameters, processRequest, sendResult } from "graphql-helix";
import { buildSchema } from "type-graphql";

import { envelop, useAsyncSchema } from "@envelop/core";
import { MetadataService } from "@simplewebauthn/server";

import { AuthResolver } from "./lib/auth/authResolver";
import { context } from "./lib/context";
import { loadEnv } from "./lib/env";
import { prisma } from "./lib/prisma";
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
import { authCheck } from "./utils/auth";

loadEnv();
void MetadataService.initialize().then(() => {
  console.log("🔐 MetadataService initialized");
});

const getEnveloped = envelop({
  plugins: [
    useAsyncSchema(
      buildSchema({
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
      })
    ),
  ],
});

const app = express();

app.get("/", (_, res) => {
  res.sendStatus(200);
});

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: [
      process.env.NODE_ENV === "production" ? "https://scrobble.moe" : "http://localhost:3000",
    ],
  })
);

app.use((req, res) => {
  const { parse, validate, contextFactory, execute, schema } = getEnveloped(
    context({ req, res, prisma })
  );

  const { operationName, query, variables } = getGraphQLParameters(req);

  void processRequest({
    operationName,
    query,
    variables,
    request: req,
    schema,
    parse,
    validate,
    execute,
    contextFactory: () => {
      return contextFactory();
    },
  }).then((result) => {
    void sendResult(result, res);
  });
});

app.listen(process.env.PORT, () => {
  console.log(`🚀 Server ready`);
});
