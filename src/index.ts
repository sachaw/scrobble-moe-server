//@ts-ignore - tmp workaround for gql-helix broken ESM support
import { getGraphQLParameters, processRequest } from "graphql-helix";
import { json } from "milliparsec";

import { envelop, useAsyncSchema } from "@envelop/core";
import { MetadataService } from "@simplewebauthn/server";
import { App } from "@tinyhttp/app";
import { cookieParser } from "@tinyhttp/cookie-parser";
import { cors } from "@tinyhttp/cors";

import { context } from "./lib/context.js";
import { initializeJobs } from "./lib/cron.js";
import { env, loadEnv } from "./lib/env.js";
import { prisma } from "./lib/prisma.js";
import { userSchema } from "./schema/user.js";

loadEnv();

// const logtail = new Logtail(env.LOGTAIL_TOKEN);

void MetadataService.initialize().then(() => {
  console.log("🔐 MetadataService initialized");
});

initializeJobs();

const getEnveloped = envelop({
  // plugins: [useLazyLoadedSchema((context) => (context ? publicSchema : userSchema))],
  plugins: [useAsyncSchema(userSchema)],
});

const app = new App();

app
  .get("/", (_, res) => {
    res.sendStatus(200);
  })
  .use(cookieParser())
  .use(json())
  .use(
    cors({
      credentials: true,
      origin:
        process.env.NODE_ENV === "production" ? "https://scrobble.moe" : "http://localhost:3000", //["http://localhost:3000", "https://scrobble.moe", "https://webhook.scrobble.moe"]
    })
  )
  .use("/", async (req, res) => {
    const { parse, validate, contextFactory, execute, schema } = getEnveloped(
      context({ req, res, prisma })
    );

    const request = {
      body: req.body as string,
      headers: req.headers,
      method: req.method as string,
      query: req.query,
    };

    const { operationName, query, variables } = getGraphQLParameters(request);
    const result = await processRequest({
      operationName,
      query,
      variables,
      request,
      schema,
      parse,
      validate,
      execute,
      contextFactory: () => {
        return contextFactory();
      },
    });

    if (result.type === "RESPONSE") {
      res.status(result.status);
      res.send(result.payload);
    } else {
      // You can find a complete example with GraphQL Subscriptions and stream/defer here:
      // https://github.com/contrawork/graphql-helix/blob/master/examples/fastify/server.ts
      res.send({ errors: [{ message: "Not Supported in this demo" }] });
    }
  })
  .listen(env.PORT, () => {
    console.log(`🚀 Server ready`);
  });
