//@ts-ignore - tmp workaround for gql-helix broken ESM support
import { getGraphQLParameters, processRequest } from "graphql-helix";
import { createYoga } from "graphql-yoga";
import { json } from "milliparsec";

import { envelop, useSchema } from "@envelop/core";
import { MetadataService } from "@simplewebauthn/server";
import { App } from "@tinyhttp/app";
import { cookieParser } from "@tinyhttp/cookie-parser";
import { cors } from "@tinyhttp/cors";

import { env, loadEnv } from "./lib/env.js";
import { schema } from "./schema/index.js";

loadEnv();

void MetadataService.initialize().then(() => {
  console.log("🔐 MetadataService initialized");
});

const getEnveloped = envelop({
  plugins: [useSchema(schema)],
});

const app = new App();
const yoga = createYoga({ schema });

app
  .use(cookieParser())
  .use(json())
  .use(
    cors({
      credentials: true,
      origin:
        process.env.NODE_ENV === "production" ? "https://scrobble.moe" : "http://localhost:3000",
    })
  )
  .use("/", yoga);

app
  .get("/", (_, res) => {
    res.sendStatus(200);
  })

  // .use("/", async (req, res) => {
  //   const { parse, validate, contextFactory, execute, schema } = getEnveloped(
  //     context({ req, res, prisma })
  //   );

  //   const request = {
  //     body: req.body as string,
  //     headers: req.headers,
  //     method: req.method as string,
  //     query: req.query,
  //   };

  //   const { operationName, query, variables } = getGraphQLParameters(request);
  //   const result = await processRequest({
  //     operationName,
  //     query,
  //     variables,
  //     request,
  //     schema,
  //     parse,
  //     validate,
  //     execute,
  //     contextFactory: () => {
  //       return contextFactory();
  //     },
  //   });

  //   if (result.type === "RESPONSE") {
  //     res.status(result.status);
  //     res.send(result.payload);
  //   } else {
  //     // You can find a complete example with GraphQL Subscriptions and stream/defer here:
  //     // https://github.com/contrawork/graphql-helix/blob/master/examples/fastify/server.ts
  //     res.send({ errors: [{ message: "Not Supported in this demo" }] });
  //   }
  // })
  .listen(env.PORT, () => {
    console.log(`🚀 Server ready`);
  });
