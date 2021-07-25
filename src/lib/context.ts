import { JwtPayload, verify } from "jsonwebtoken";

import { PrismaClient, User } from "@prisma/client";
import * as Sentry from "@sentry/node";
import { Transaction } from "@sentry/types";

import prisma from "./prisma";

export interface Context {
  prisma: PrismaClient;
  user: User | undefined;
  transaction: Transaction;
  token: string | JwtPayload | undefined;
}

/**
 * Tmp workaround for `ExpressContext` not being exported from apollo-server
 */
const context = async (ctx: any): Promise<Context> => {
  const transaction = Sentry.startTransaction({
    op: "gql",
    name: "GraphQLTransaction",
  });
  const token = ctx.req.headers.authorization || "";
  let user: User | undefined;
  let decoded: string | JwtPayload | undefined;

  if (token.startsWith("Bearer ") && token.length > 7) {
    decoded = verify(token.substring(7), process.env.JWT_SECRET);
    if (decoded) {
      user = await prisma.user.findUnique({
        where: {
          id: decoded.sub as string,
        },
      });
    }
  }

  return { prisma, user, transaction, token: decoded };
};

export default context;
