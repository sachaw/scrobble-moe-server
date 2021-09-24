/**
 * Tmp workaround for `ExpressContext` not being exported from apollo-server
 */
import { ExpressContext } from "apollo-server-express";
import { verify } from "jsonwebtoken";

import { PrismaClient, User } from "@prisma/client";
import * as Sentry from "@sentry/node";
import { Transaction } from "@sentry/types";

import prisma from "./prisma";

export interface Context {
  prisma: PrismaClient;
  user?: User;
  transaction: Transaction;
  // token: string | JwtPayload | undefined;
  setTokens(token: string): void;
}

/**
 * Tmp workaround for `ExpressContext` not being exported from apollo-server
 */
export const context = async (ctx: ExpressContext): Promise<Context> => {
  const transaction = Sentry.startTransaction({
    op: "gql",
    name: "GraphQLTransaction",
  });

  let user: User | undefined;

  if (typeof ctx.req.headers.cookie === "string") {
    const tokenRegex = new RegExp(
      /tokens=(?<access_token>[\w-]*\.[\w-]*\.[\w-]*)~(?<refresh_token>[\w-]*\.[\w-]*\.[\w-]*)/
    );
    const tokens = tokenRegex.exec(ctx.req.headers.cookie);
    console.log(ctx.req.headers.cookie);

    if (tokens && tokens.groups) {
      const { access_token, refresh_token } = tokens.groups;
      const decoded = verify(access_token, process.env.JWT_SECRET ?? "");
      const tmpUser = await prisma.user.findUnique({
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

  return { prisma, transaction, user, setTokens };
};
