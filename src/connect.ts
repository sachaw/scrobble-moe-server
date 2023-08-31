import { AuthService } from "@buf/scrobble-moe_protobufs.bufbuild_connect-es/moe/scrobble/auth/v1/auth_service_connect.js";
import { FeedService } from "@buf/scrobble-moe_protobufs.bufbuild_connect-es/moe/scrobble/feed/v1/feed_service_connect.js";
import { ModelService } from "@buf/scrobble-moe_protobufs.bufbuild_connect-es/moe/scrobble/model/v1/model_service_connect.js";
import { WebhookService } from "@buf/scrobble-moe_protobufs.bufbuild_connect-es/moe/scrobble/webhook/v1/webhook_service_connect.js";
import { ConnectRouter } from "@connectrpc/connect";
import { Auth } from "./rpc/auth.js";
import { Feed } from "./rpc/feed.js";
import { Model } from "./rpc/model.js";
import { Webhook } from "./rpc/webhook.js";
import { UserManager } from "./utils/userManager.js";

export const routes = (router: ConnectRouter, tokenManager: UserManager) => {
  router.service(AuthService, new Auth(tokenManager));
  router.service(FeedService, new Feed(tokenManager));
  router.service(ModelService, new Model(tokenManager));
  router.service(WebhookService, new Webhook());
};
