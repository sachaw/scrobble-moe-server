import "reflect-metadata";

import { ApolloError, ApolloServer } from "apollo-server";
import { config } from "dotenv";
import { verify } from "jsonwebtoken";
import { buildSchema } from "type-graphql";

import { PrismaClient, User } from "@prisma/client";
import * as Sentry from "@sentry/node";

import { authCheck } from "./auth/authCheck";
import { AuthResolver } from "./auth/authResolver";
import { ScrobbleResolver } from "./models/scrobbleResolver";
import { UserResolver } from "./models/userResolver";

export interface Context {
  prisma: PrismaClient;
  user: User | undefined;
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

      return { prisma, user };
    },
    plugins: [
      {
        async requestDidStart(ctx) {
          return {
            async didEncounterErrors(ctx) {
              // If we couldn't parse the operation, don't
              // do anything here
              if (!ctx.operation) {
                return;
              }
              for (const err of ctx.errors) {
                // Only report internal server errors,
                // all errors extending ApolloError should be user-facing
                if (err instanceof ApolloError) {
                  continue;
                }
                // Add scoped report details and send to Sentry
                Sentry.withScope((scope) => {
                  // Annotate whether failing operation was query/mutation/subscription
                  scope.setTag("kind", ctx.operation.operation);
                  // Log query and variables as extras
                  // (make sure to strip out sensitive data!)
                  scope.setExtra("query", ctx.request.query);
                  scope.setExtra("variables", ctx.request.variables);
                  if (err.path) {
                    // We can also add the path as breadcrumb
                    scope.addBreadcrumb({
                      category: "query-path",
                      message: err.path.join(" > "),
                      level: Sentry.Severity.Debug,
                    });
                  }
                  Sentry.captureException(err);
                });
              }
            },
          };
        },
      },
    ],
  }).listen({ port: 4000 }, () =>
    console.log(`
🚀 Server ready at: http://localhost:4000`)
  );
};

app();
