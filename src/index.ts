import "reflect-metadata";

import { ApolloServer } from "apollo-server";
import { config } from "dotenv";
import { verify } from "jsonwebtoken";
import { buildSchema } from "type-graphql";

import { PrismaClient, User } from "@prisma/client";
import * as Sentry from "@sentry/node";
import { Transaction } from "@sentry/types";

import { authCheck } from "./auth/authCheck";
import { AuthResolver } from "./auth/authResolver";
import { ScrobbleResolver } from "./models/scrobbleResolver";
import { UserResolver } from "./models/userResolver";
import sentryPlugin from "./plugins/sentry";
import sentryPerformancePlugin from "./plugins/sentryPerformance";

export interface Context {
  prisma: PrismaClient;
  user: User | undefined;
  transaction: Transaction;
}

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  integrations: [new Sentry.Integrations.Http({ tracing: true })],
});

config();

const app = async () => {
  const schema = await buildSchema({
    resolvers: [AuthResolver, UserResolver, ScrobbleResolver],
    authChecker: authCheck,
  });

  new ApolloServer({
    schema,
    context: async ({ req }): Promise<Context> => {
      const transaction = Sentry.startTransaction({
        op: "gql",
        name: "GraphQLTransaction",
      });
      const token = req.headers.authorization || "";
      let user: User | undefined;
      const prisma = new PrismaClient();

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
    },
    plugins: [sentryPlugin, sentryPerformancePlugin],
  }).listen({ port: 4000 }, () =>
    console.log(`
🚀 Server ready at: http://localhost:4000`)
  );
};

app();
