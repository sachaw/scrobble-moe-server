import { routes } from "./connect.js";
import { UserManager } from "./utils/userManager.js";
import { expressConnectMiddleware } from "@bufbuild/connect-express";
import { MetadataService } from "@simplewebauthn/server";
import { App, Response } from "@tinyhttp/app";
import { cookieParser } from "@tinyhttp/cookie-parser";
import { cors } from "@tinyhttp/cors";
import { logger } from "@tinyhttp/logger";

// export NODE_OPTIONS="--no-network-family-autoselection"

const app = new App();

await MetadataService.initialize({
  verificationMode: "permissive",
}).then(() => {
  console.log("🔐 MetadataService initialized");
});

app
  .use(logger())
  .use(cookieParser())
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
  .use(async (req, res: Response, next) => {
    const userManager = new UserManager(
      process.env.PASETO_SECRET_KEY,
      process.env.PASETO_PUBLIC_KEY,
    );
    const token = req.cookies?.Token;

    if (token) {
      userManager.setToken(token);
    }

    return expressConnectMiddleware({
      routes: (router) => {
        return routes(router, userManager);
      },
      connect: true,
      // @ts-ignore
    })(req, res, next);
  })
  .listen(parseInt(process.env.PORT), async () => {
    console.log(`🚀 Server listening on port ${process.env.PORT}`);
  });
