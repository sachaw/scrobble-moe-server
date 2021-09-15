import { ApolloServerPlugin } from "apollo-server-plugin-base";

const plugin: ApolloServerPlugin = {
  async requestDidStart(ctx) {
    if (ctx.request.operationName) {
      ctx.context.transaction.setName(ctx.request.operationName!);
    }
    return {
      async willSendResponse(ctx) {
        ctx.context.transaction.finish();
      },
      async executionDidStart() {
        return {
          willResolveField({ context, info }) {
            const span = context.transaction.startChild({
              op: "resolver",
              description: `${info.parentType.name}.${info.fieldName}`,
            });
            return () => {
              span.finish();
            };
          },
        };
      },
    };
  },
};

export default plugin;
