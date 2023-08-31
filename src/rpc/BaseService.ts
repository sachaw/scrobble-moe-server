import { Code, ConnectError, HandlerContext } from "@connectrpc/connect";
import { Role } from "@prisma/client";
import { UserManager } from "../utils/userManager.js";

export abstract class BaseService<T> {
  protected userManager: UserManager;

  constructor(userManager: UserManager) {
    this.userManager = userManager;
  }

  protected async authorization(ctx: HandlerContext, role?: Role) {
    console.log("calling authorization");

    await this.userManager.verifyToken(ctx);

    console.log("authorized");

    console.log(this.userManager.user);

    const user = this.userManager.user;

    console.log(user);

    if (!user) {
      throw new ConnectError(
        "User is not authenticated.",
        Code.Unauthenticated,
      );
    }

    if (!role || user.role === role) {
      console.log("User has the correct role");

      return;
    }

    console.log("User does not have the correct role");

    throw new ConnectError(
      `User does not have the ${role} role.`,
      Code.PermissionDenied,
    );
  }
}
