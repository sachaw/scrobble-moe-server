import { Provider } from "@prisma/client";

import { builder } from "../../builder.js";

export const linkedAccountModel = () =>
  builder.prismaObject("LinkedAccount", {
    fields: (t) => ({
      id: t.exposeID("id"),
      createdAt: t.expose("createdAt", { type: "Date" }),
      updatedAt: t.expose("updatedAt", { type: "Date" }),
      provider: t.expose("provider", { type: Provider }),
      accountId: t.exposeString("accountId"),
      // accessToken: t.exposeString("accessToken"), //TODO: Do no expose
      // accessTokenExpires: t.expose("accessTokenExpires"),
      // refreshToken: t.exposeString("refreshToken"), //TODO: Do no expose

      scrobbles: t.relation("scrobbles"),
      user: t.relation("user"),
    }),
  });
