import { Request, Response } from "express";
import { verify } from "jsonwebtoken";

import { PrismaClient, User } from "@prisma/client";

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
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  if (ctx.req.cookies && ctx.req.cookies.tokens) {
    const tokenRegex = new RegExp(
      /(?<access_token>[\w-]*\.[\w-]*\.[\w-]*)~(?<refresh_token>[\w-]*\.[\w-]*\.[\w-]*)/
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const tokens = tokenRegex.exec(ctx.req.cookies.tokens);

    if (tokens && tokens.groups) {
      const { access_token, refresh_token } = tokens.groups;

      const decoded = verify(access_token, process.env.JWT_SECRET ?? "");

      const tmpUser = await ctx.prisma.user.findUnique({
        where: {
          id: decoded.sub as string,
        },
      });

      if (tmpUser) {
        user = tmpUser;
      }
    }
  }

  const setTokens = (token: string): void => {
    ctx.res.cookie("tokens", token, {
      httpOnly: true,
      domain: process.env.NODE_ENV === "production" ? "scrobble.moe" : "localhost",
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });
  };

  return { prisma: ctx.prisma, user, setTokens };
};
