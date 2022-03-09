import { Logtail } from "@logtail/node";

import { env } from "./env.js";

export const logger = new Logtail(env.LOGTAIL_TOKEN);
