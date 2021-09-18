import { ApolloError } from "apollo-server";
import { ApolloServerPlugin } from "apollo-server-plugin-base";

import * as Sentry from "@sentry/node";

const plugin: ApolloServerPlugin = {
  async requestDidStart(ctx) {
    return await Promise.resolve({
      async didEncounterErrors(ctx) {
        if (!ctx.operation) {
          return;
        }
        for (const err of ctx.errors) {
          if (err instanceof ApolloError) {
            continue;
          }
          Sentry.withScope((scope) => {
            scope.setTag("kind", ctx.operation.operation);
            scope.setExtra("query", ctx.request.query);
            scope.setExtra("variables", ctx.request.variables);
            if (err.path) {
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
    });
  },
};

export default plugin;
