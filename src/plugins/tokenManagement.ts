import { ApolloServerPlugin } from "apollo-server-plugin-base";
import { verify } from "jsonwebtoken";

import { env } from "../lib/env";

const plugin: ApolloServerPlugin = {
  async requestDidStart(ctx) {
    const rawCookies = ctx.request.http?.headers.get("cookie");

    // console.log(ctx.operation);

    if (rawCookies) {
      const cookies = rawCookies.split(";").map((cookie) => cookie.trim().split("="));

      const access_token = cookies.find((cookie) => cookie[0] === "access_token");
      const refresh_token = cookies.find((cookie) => cookie[0] === "refresh_token");

      if (access_token) {
        const decoded = verify(access_token[1], env.JWT_SECRET);
        return Promise.resolve();
      }

      if (refresh_token) {
        const decoded = verify(refresh_token[1], env.JWT_SECRET);
        return Promise.resolve();
      }
    }

    return {};

    // ctx.response?.http?.headers

    // ctx.response?.http?.headers.set(
    //   "Set-Cookie",
    //   ["access_token=ffdd443344; HttpOnly; SameSite=None; Secure", "refresh_token=DEF456; HttpOnly; SameSite=None; Secure"]
    // );
    // ctx.
  },
};

export default plugin;
