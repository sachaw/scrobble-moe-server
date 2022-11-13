import { Transport } from "@prisma/client";

import { builder } from "../../builder.js";

export const authenticatorModel = () =>
  builder.prismaObject("Authenticator", {
    fields: (t) => ({
      id: t.exposeID("id"),
      createdAt: t.expose("createdAt", { type: "Date" }),
      updatedAt: t.expose("updatedAt", { type: "Date" }),
      AAGUID: t.exposeString("AAGUID"),
      //   credentialID: t.expose("credentialID", {}),
      // credentialPublicKey: t.expose('credentialPublicKey', {}),
      counter: t.exposeInt("counter"),
      revoked: t.exposeBoolean("revoked"),
      transports: t.expose("transports", { type: [Transport] }),

      user: t.relation("user"),
    }),
  });
