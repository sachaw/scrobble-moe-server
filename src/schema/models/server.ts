import { builder } from "../../builder.js";

export const serverModel = () =>
  builder.prismaObject("Server", {
    fields: (t) => ({
      id: t.exposeID("id"),
      createdAt: t.expose("createdAt", { type: "Date" }),
      updatedAt: t.expose("updatedAt", { type: "Date" }),
      uuid: t.exposeString("uuid"),
      secret: t.exposeString("secret"),
      name: t.exposeString("name"),

      user: t.relation("users"),
      server: t.relation("scrobbles"),
    }),
  });
