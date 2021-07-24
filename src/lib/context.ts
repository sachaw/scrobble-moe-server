import { verify } from "jsonwebtoken";

import { User } from "@prisma/client";
import * as Sentry from "@sentry/node";

import prisma from "./prisma";

/**
 * Tmp workaround for `ExpressContext` not being exported from apollo-server
 */
const context = async (ctx: any) => {
  const transaction = Sentry.startTransaction({
    op: "gql",
    name: "GraphQLTransaction",
  });
  const token = ctx.req.headers.authorization || "";
  let user: User | undefined;

  if (token.startsWith("Bearer ") && token.length > 7) {
    const decoded = verify(token.substring(7), process.env.JWT_SECRET);
    if (decoded) {
      user = await prisma.user.findUnique({
        where: {
          id: decoded.sub as string,
        },
      });
    }
  }

  return { prisma, user, transaction };
};

export default context;
