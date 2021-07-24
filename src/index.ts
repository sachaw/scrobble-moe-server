import "reflect-metadata";

import { ApolloServer } from "apollo-server";
import { config } from "dotenv";
import { buildSchema } from "type-graphql";

import { PrismaClient, User } from "@prisma/client";
import { Transaction } from "@sentry/types";

import { authCheck } from "./auth/authCheck";
import { AuthResolver } from "./auth/authResolver";
import context from "./lib/context";
import sentry from "./lib/sentry";
import { ScrobbleResolver } from "./models/scrobbleResolver";
import { UserResolver } from "./models/userResolver";
import sentryPlugin from "./plugins/sentry";
import sentryPerformancePlugin from "./plugins/sentryPerformance";

export interface Context {
  prisma: PrismaClient;
  user: User | undefined;
  transaction: Transaction;
}

config();
sentry();

const app = async () => {
  const schema = await buildSchema({
    resolvers: [AuthResolver, UserResolver, ScrobbleResolver],
    authChecker: authCheck,
  });

  new ApolloServer({
    schema,
    context: context,
    plugins: [sentryPlugin, sentryPerformancePlugin],
  }).listen({ port: 4000 }, () => console.log(`🚀 Server ready`));
};

app();
