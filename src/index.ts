import { createYoga } from "graphql-yoga";
import { json } from "milliparsec";

import { MetadataService } from "@simplewebauthn/server";
import { App } from "@tinyhttp/app";
import { cookieParser } from "@tinyhttp/cookie-parser";
import { cors } from "@tinyhttp/cors";

import { env, loadEnv } from "./lib/env.js";
import { schema } from "./schema.js";
import { createId } from "@paralleldrive/cuid2";
import { prisma } from "./lib/prisma.js";

loadEnv();

await MetadataService.initialize({
  verificationMode: "permissive",
}).then(() => {
  console.log("🔐 MetadataService initialized");
});

const app = new App();
const yoga = createYoga({
  schema,
  context: (req) => {
    return {
      prisma,
    };
  },
});

app
  .use(cookieParser())
  .use(json())
  .use(
    cors({
      credentials: true,
      origin:
        process.env.NODE_ENV === "production"
          ? "https://scrobble.moe"
          : "http://localhost:3000",
    }),
  )
  .use("/", yoga)
  .listen(env.PORT, () => {
    console.log("🚀 Server ready");
  });
