import { MetadataService } from "@simplewebauthn/server";
import { expressConnectMiddleware } from "@bufbuild/connect-express";

import { routes } from "./connect.js";

import { App } from "@tinyhttp/app";
import { cors } from "@tinyhttp/cors";
import { logger } from "@tinyhttp/logger";
import { jwt } from "@tinyhttp/jwt";
import { client, secrets } from "./lib/infisical.js";

const app = new App();

await MetadataService.initialize({
  verificationMode: "permissive",
}).then(() => {
  console.log("🔐 MetadataService initialized");
});

app
  .use(logger())
  .use(
    jwt({
      secret: [secrets.JWT_PUBLIC_KEY, secrets.JWT_PRIVATE_KEY],
    }),
  )
  .use(
    cors({
      credentials: true,
      allowedHeaders: [
        "Content-Type",
        "Authorization",
        "X-Custom-Header",
        "Connect-Protocol-Version",
      ],
      origin:
        process.env.NODE_ENV === "production"
          ? "https://scrobble.moe"
          : "http://localhost:3000",
    }),
  )
  .use(
    // @ts-ignore
    expressConnectMiddleware({
      routes,
      connect: true,
    }),
  )
  .listen(secrets.PORT, async () => {
    console.log(`🚀 Server listening on port ${secrets.PORT}`);
  });
