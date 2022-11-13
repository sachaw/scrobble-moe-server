import { Provider, ScrobbleStatus } from "@prisma/client";

import { builder } from "../../builder.js";

export const scrobbleProviderStatusModel = () =>
  builder.prismaObject("ScrobbleProviderStatus", {
    fields: (t) => ({
      id: t.exposeID("id"),
      createdAt: t.expose("createdAt", { type: "Date" }),
      updatedAt: t.expose("updatedAt", { type: "Date" }),
      status: t.expose("status", { type: ScrobbleStatus }),
      provider: t.expose("provider", { type: Provider }),

      scrobble: t.relation("scrobble"),
    }),
  });
