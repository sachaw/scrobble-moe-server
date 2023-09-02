import { Code, ConnectError, HandlerContext } from "@connectrpc/connect";
import { Role } from "@prisma/client";
import { UserManager } from "../utils/userManager.js";

export abstract class BaseService<T> {
  protected userManager: UserManager;

  constructor(userManager: UserManager) {
    this.userManager = userManager;
  }

  protected async authorization(ctx: HandlerContext, role?: Role) {
    await this.userManager.verifyToken(ctx);
    const user = this.userManager.user;

    if (!user) {
      throw new ConnectError(
        "User is not authenticated.",
        Code.Unauthenticated,
      );
    }

    if (role && user.role !== role) {
      throw new ConnectError(
        `User does not have the ${role} role.`,
        Code.PermissionDenied,
      );
    }
  }
}
