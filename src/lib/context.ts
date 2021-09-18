/**
 * Tmp workaround for `ExpressContext` not being exported from apollo-server
 */
import { AuthenticationError, ExpressContext } from "apollo-server-express";
import { JwtPayload } from "jsonwebtoken";

import { PrismaClient, User } from "@prisma/client";
import * as Sentry from "@sentry/node";
import { Transaction } from "@sentry/types";

import prisma from "./prisma";

export interface Context {
  prisma: PrismaClient;
  user: User;
  transaction: Transaction;
  token: string | JwtPayload | undefined;
}

/**
 * Tmp workaround for `ExpressContext` not being exported from apollo-server
 */
export const context = async (ctx: ExpressContext): Promise<Context> => {
  const transaction = Sentry.startTransaction({
    op: "gql",
    name: "GraphQLTransaction",
  });
  // const token = ctx.req.headers.authorization || "";
  // const decoded = verify(token.substring(7), env.JWT_SECRET);
  // const user = await prisma.user.findUnique({
  //   where: {
  //     id: decoded.sub as string,
  //   },
  // });

  const user = await prisma.user.findUnique({
    where: {
      id: "cktmd1l9800841nuiiq36t9av",
    },
    rejectOnNotFound: true,
  });

  if (!user) {
    throw new AuthenticationError("TEMPORARY");
  }
  const decoded = "";

  return { prisma, user, transaction, token: decoded };
};
