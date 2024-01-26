import { expressConnectMiddleware } from "@connectrpc/connect-express";
import { MetadataService } from "@simplewebauthn/server";
import type { Response } from "@tinyhttp/app";
import { App } from "@tinyhttp/app";
import { cookieParser } from "@tinyhttp/cookie-parser";
import { cors } from "@tinyhttp/cors";
import { logger } from "@tinyhttp/logger";
import { routes } from "./services/index.js";
import { UserManager } from "./utils/index.js";

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
      origin(req, res) {
        // allow requests with no origin
        if (!req.headers.origin) {
          return "";
        }

        const whitelist = [
          process.env.NODE_ENV === "production"
            ? "https://scrobble.moe"
            : "http://localhost:3000",
          "https://buf.build",
        ];

        // return origin if it is in the whitelist
        if (whitelist.indexOf(req.headers.origin) !== -1) {
          return req.headers.origin;
        } else {
          throw new Error("Origin not allowed by CORS");
        }
      },
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
  .listen(Number.parseInt(process.env.PORT));
