import { builder } from "../../builder.js";

const WebhookInput = builder.inputType("WebhookInput", {
  fields: (t) => ({
    secret: t.string(),
    username: t.string(),
    serverUUID: t.string(),
    providerMediaId: t.int(),
    episode: t.int(),
  }),
});

class Webhook {
  success: boolean;
  reason: string;
}
