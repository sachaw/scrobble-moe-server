import { builder } from "../../builder.js";

export const scrobbleModel = () =>
  builder.prismaObject("Scrobble", {
    fields: (t) => ({
      id: t.exposeID("id"),
      createdAt: t.expose("createdAt", { type: "Date" }),
      updatedAt: t.expose("updatedAt", { type: "Date" }),
      providerMediaId: t.exposeString("providerMediaId"),
      episode: t.exposeInt("episode"),

      user: t.relation("user"),
      server: t.relation("server"),
      accounts: t.relation("accounts"),
      status: t.relation("status"),
    }),
  });
