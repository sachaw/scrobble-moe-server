import { TokenType } from "@prisma/client";

import { builder } from "../../builder.js";

export const tokenModel = () =>
  builder.prismaObject("Token", {
    fields: (t) => ({
      id: t.exposeID("id"),
      createdAt: t.expose("createdAt", { type: "Date" }),
      updatedAt: t.expose("updatedAt", { type: "Date" }),
      hashedToken: t.exposeString("hashedToken"),
      expiresAt: t.expose("expiresAt", { type: "Date" }),
      type: t.expose("type", { type: TokenType }),

      user: t.relation("user"),
    }),
  });
