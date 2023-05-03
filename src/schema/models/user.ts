import { Role } from "@prisma/client";

import { builder } from "../../builder.js";
import { prisma } from "../../lib/prisma.js";

export const userModel = () => {
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

  builder.queryType({
    fields: (t) => ({
      user: t.prismaField({
        type: "User",
        nullable: true,
        args: {
          id: t.arg.id({ required: true }),
        },
        resolve: (query, root, args) =>
          prisma.user.findUnique({
            ...query,
            where: { id: String(args.id) },
          }),
      }),
    }),
  });
};
