import { Code, ConnectError, ConnectRouter } from "@bufbuild/connect";

import { GetUserResponse } from "@protobufs/model/v1/model_pb.js";
import { prisma } from "./lib/prisma.js";
import { Auth } from "./rpc/auth.js";
import { AuthService } from "@protobufs/auth/v1/auth_service_connect.js";
import { FeedService } from "@protobufs/feed/v1/feed_service_connect.js";
import { ModelService } from "@protobufs/model/v1/model_service_connect.js";
import { Feed } from "./rpc/feed.js";
import { Model } from "./rpc/model.js";

export const routes = (router: ConnectRouter) => {
  router.service(AuthService, new Auth());
  router.service(FeedService, new Feed());
  router.service(ModelService, new Model());
  // router.service(UserService, {
  //   async getUser(req) {
  //     console.log("user", req);

  //     const user = await prisma.user.findUnique({
  //       where: req,
  //     });

  //     if (!user) {
  //       throw new ConnectError(
  //         `User ${req.id ?? req.email ?? req.plexId} not found`,
  //         Code.NotFound,
  //       );
  //     }
  //     const response = new GetUserResponse({
  //       id: user.id,
  //       plexId: user.plexId,
  //     });
  //     return response;
  //   },
  // });
};
