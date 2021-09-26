// @ts-nocheck tmp workaround for global assignment in dev

import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  prisma = global.prisma;
}

export const prisma = prisma;
