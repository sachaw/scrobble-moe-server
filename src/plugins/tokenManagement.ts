import { ApolloServerPlugin } from "apollo-server-plugin-base";
import { verify } from "jsonwebtoken";

import { env } from "../lib/env";

const plugin: ApolloServerPlugin = {
  async requestDidStart(ctx) {
    const tokenRegex = new RegExp(
      /tokens=(?<access_token>[\w-]*\.[\w-]*\.[\w-]*)\|(?<refresh_token>[\w-]*\.[\w-]*\.[\w-]*)/
    );

    const tokens = tokenRegex.exec(ctx.request.http?.headers.get("cookie") ?? "");

    if (!tokens || !tokens.groups) {
      return await Promise.resolve({});
    }

    const { access_token, refresh_token } = tokens.groups;

    if (!access_token || !refresh_token) {
      return await Promise.resolve({});
    }

    const refresh_token_verified = verify(refresh_token, env.JWT_SECRET);

    const access_token_verified = verify(access_token, env.JWT_SECRET, (err, payload) => {
      if (err?.name === "TokenExpiredError") {
        ctx.response?.http?.headers.set(
          "Set-Cookie",
          "tokens=********; HttpOnly; SameSite=None; Secure"
        );
        return;
      }

      if (payload?.exp && payload?.exp > new Date().getTime() + 6e4) {
        ctx.response?.http?.headers.set(
          "Set-Cookie",
          "tokens=********; HttpOnly; SameSite=None; Secure"
        );
        return;
      }

      return refresh_token_verified;

      throw err;
    });
  },
};

export default plugin;
