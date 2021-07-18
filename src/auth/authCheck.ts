import { AuthChecker } from "type-graphql";

import { Context } from "../";

export const authCheck: AuthChecker<Context> = async ({ root, args, context, info }, roles) => {
  const { user, prisma } = context;

  if (!user.id) {
    return false;
  }

  if (roles.find((r) => r === user.role)) {
    return true;
  }

  return false;
};
