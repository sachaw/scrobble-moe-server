import { buildSchema } from "type-graphql";

import { WebhookResolver } from "../lib/webhook/webhookResolver.js";
import { AuthenticatorResolver } from "../models/authenticatorResolver.js";
import { AuthResolver } from "../models/authResolver.js";
import { EncoderResolver } from "../models/encoderResolver.js";
import { LinkedAccountResolver } from "../models/linkedAccountResolver.js";
import { ScrobbleResolver } from "../models/scrobbleResolver.js";
import { SeriesSubscriptionResolver } from "../models/seriesSubscriptionResolver.js";
import { ServerResolver } from "../models/serverResolver.js";
import { TokenResolver } from "../models/tokenResolver.js";
import { TorrentClientResolver } from "../models/torrentClientResolver.js";
import { UserResolver } from "../models/userResolver.js";
import { authCheck } from "../utils/auth.js";

export const publicSchema = buildSchema({
  resolvers: [
    AuthResolver,
    AuthenticatorResolver,
    EncoderResolver,
    LinkedAccountResolver,
    ScrobbleResolver,
    SeriesSubscriptionResolver,
    ServerResolver,
    TokenResolver,
    TorrentClientResolver,
    UserResolver,
    WebhookResolver,
  ],
  authChecker: authCheck,
  dateScalarMode: "isoDate",
  scalarsMap: [],
});
