import SchemaBuilder from "@pothos/core";
import PrismaPlugin from "@pothos/plugin-prisma";

import type PrismaTypes from "./generated/pothos-types.js";
import { prisma } from "./lib/prisma.js";

export const builder = new SchemaBuilder<{
  PrismaTypes: PrismaTypes;
  Scalars: {
    Date: {
      Input: Date;
      Output: Date;
    };
  };
}>({
  plugins: [PrismaPlugin],
  prisma: {
    client: prisma,
  },
});
