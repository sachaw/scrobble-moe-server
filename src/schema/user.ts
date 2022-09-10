import { buildSchema } from "type-graphql";
import { Container } from "typedi";

import { WebhookResolver } from "../lib/webhook/webhookResolver.js";
import { AuthenticatorResolver } from "../models/authenticatorResolver.js";
import { AuthResolver } from "../models/authResolver.js";
import { LinkedAccountResolver } from "../models/linkedAccountResolver.js";
import { ScrobbleResolver } from "../models/scrobbleResolver.js";
import { ServerResolver } from "../models/serverResolver.js";
import { TokenResolver } from "../models/tokenResolver.js";
import { UserResolver } from "../models/userResolver.js";
import { authCheck } from "../utils/auth.js";

export const userSchema = buildSchema({
  resolvers: [
    AuthResolver,
    AuthenticatorResolver,
    LinkedAccountResolver,
    ScrobbleResolver,
    ServerResolver,
    TokenResolver,
    UserResolver,
    WebhookResolver,
  ],
  authChecker: authCheck,
  dateScalarMode: "isoDate",
  scalarsMap: [],
  container: Container,
});
