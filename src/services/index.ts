import { AuthService } from "@buf/scrobble-moe_protobufs.bufbuild_connect-es/moe/scrobble/auth/v1/auth_service_connect.js";
import { ModelService } from "@buf/scrobble-moe_protobufs.bufbuild_connect-es/moe/scrobble/model/v1/model_service_connect.js";
import { WebhookService } from "@buf/scrobble-moe_protobufs.bufbuild_connect-es/moe/scrobble/webhook/v1/webhook_service_connect.js";
import type { ConnectRouter } from "@connectrpc/connect";
import type { UserManager } from "../utils/index.js";
import { Auth } from "./auth.js";
import { Model } from "./model.js";
import { Webhook } from "./webhook.js";

export const routes = (router: ConnectRouter, tokenManager: UserManager) => {
  router.service(AuthService, new Auth(tokenManager));
  router.service(ModelService, new Model(tokenManager));
  router.service(WebhookService, new Webhook());
};
