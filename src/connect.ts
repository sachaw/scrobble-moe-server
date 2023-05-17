import { Code, ConnectError, ConnectRouter } from "@bufbuild/connect";
import { UserService } from "@protobufs/models/v1/models_connect.js";
import { GetUserResponse } from "@protobufs/models/v1/models_pb.js";
import { prisma } from "./lib/prisma.js";
import { Auth } from "./rpc/auth.js";
import { AuthService } from "@protobufs/auth/v1/auth_connect.js";
import { FeedService } from "@protobufs/feed/v1/feed_service_connect.js";
import { Feed } from "./rpc/feed.js";

export const routes = (router: ConnectRouter) => {
  router.service(AuthService, new Auth());
  router.service(FeedService, new Feed());
  router.service(UserService, {
    async getUser(req) {
      console.log("user", req);

      const user = await prisma.user.findUnique({
        where: req,
      });

      if (!user) {
        throw new ConnectError(
          `User ${req.id ?? req.email ?? req.plexId} not found`,
          Code.NotFound,
        );
      }
      const response = new GetUserResponse({
        id: user.id,
        plexId: user.plexId,
      });
      return response;
    },
  });
};
