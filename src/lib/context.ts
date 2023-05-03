import { verify } from "jsonwebtoken";

import { PrismaClient, User } from "@prisma/client";
import { Request, Response } from "@tinyhttp/app";

import { env } from "./env.js";

export interface ContextInput {
  req: Request;
  res: Response;
  prisma: PrismaClient;
}

export interface Context {
  prisma: PrismaClient;
  user?: User;
  setTokens(token: string): void;
}

export const context = async (ctx: ContextInput): Promise<Context> => {
  let user: User | undefined;

  if (ctx.req.cookies.tokens) {
    const tokenRegex = new RegExp(
      /(?<access_token>[\w-]*\.[\w-]*\.[\w-]*)~(?<refresh_token>[\w-]*\.[\w-]*\.[\w-]*)/,
    );
    const tokens = tokenRegex.exec(ctx.req.cookies.tokens);

    if (tokens?.groups) {
      const { access_token, refresh_token } = tokens.groups;

      try {
        const decoded = verify(access_token, env.JWT_SECRET);

        const tmpUser = await ctx.prisma.user.findUnique({
          where: {
            id: decoded.sub as string,
          },
        });

        if (tmpUser) {
          user = tmpUser;
        }
      } catch (error) {
        ctx.res.clearCookie("tokens");
      }
    }
  }

  const setTokens = (token: string): void => {
    ctx.res.cookie("tokens", token, {
      httpOnly: true,
      domain:
        process.env.NODE_ENV === "production" ? "scrobble.moe" : "localhost",
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });
  };

  return { prisma: ctx.prisma, user, setTokens };
};
