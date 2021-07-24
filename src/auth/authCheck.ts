import { AuthChecker } from "type-graphql";

import { Context } from "../";

export const authCheck: AuthChecker<Context> = async ({ root, args, context, info }, roles) => {
  const { user } = context;

  if (!user) {
    return false;
  }

  if (roles.find((r) => r === user.role)) {
    return true;
  }

  return false;
};
