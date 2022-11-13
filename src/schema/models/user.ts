import { Role } from "@prisma/client";

import { builder } from "../../builder.js";

export const userModel = () =>
  builder.prismaObject("User", {
    fields: (t) => ({
      id: t.exposeID("id"),
      createdAt: t.expose("createdAt", { type: "Date" }),
      updatedAt: t.expose("updatedAt", { type: "Date" }),
      username: t.exposeString("username"),
      email: t.exposeString("email"),
      plexId: t.exposeInt("plexId"),
      plexAuthToken: t.exposeString("plexAuthToken"),
      thumb: t.exposeString("thumb"),
      //   authenticationChallenge: t.exposeString("authenticationChallenge`"),
      //   authenticationChallengeExpiresAt: t.expose("authenticationChallengeExpiresAt", { type: "Date" }),
      role: t.expose("role", { type: Role }),

      authenticators: t.relation("authenticators"),
      accounts: t.relation("accounts"),
      tokens: t.relation("tokens"),
      scrobbles: t.relation("scrobbles"),
      servers: t.relation("servers"),
    }),
  });
