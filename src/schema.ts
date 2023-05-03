import { builder } from "./builder.js";
import { authenticatorModel } from "./schema/models/authenticator.js";
import { linkedAccountModel } from "./schema/models/linkedAccount.js";
import { scrobbleModel } from "./schema/models/scrobble.js";
import { scrobbleProviderStatusModel } from "./schema/models/scrobbleProviderStatus.js";
import { serverModel } from "./schema/models/server.js";
import { tokenModel } from "./schema/models/token.js";
import { userModel } from "./schema/models/user.js";
import { registerEnums } from "./schema/registerEnums.js";
import { registerScalars } from "./schema/registerScalars.js";
import "./schema/authentication/plexAuthenticationMutation.js";

registerScalars();
registerEnums();

authenticatorModel();
linkedAccountModel();
scrobbleModel();
scrobbleProviderStatusModel();
serverModel();
tokenModel();
userModel();

export const schema = builder.toSchema();
