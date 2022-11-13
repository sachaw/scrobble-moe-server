import { builder } from "../../builder.js";

export enum AuthenticationType {
  AUTHENTICATION,
  REGISTRATION,
}

//   registerEnumType(AuthenticationType, {
//     name: "AuthenticationType",
//   });

// export class AuthenticationInput {
//   plexToken: string;
// }

export class PlexUser {
  username: string;

  avatar: string;
}

export class AuthResponse {
  type: AuthenticationType;

  webauthnOptions: string;

  plexUser: PlexUser;
}

export class WebauthnInput {
  type: AuthenticationType;

  verification: string;

  plexToken: string;
}

export class TokenResponse {
  success: boolean;
}

export class AuthCheckResponse {
  authenticated: boolean;
}

export const authModel = () => {
  builder.objectType(AuthResponse, {
    name: "AuthResponse",
    fields: (t) => ({
      type: t.expose("type", {
        type: AuthenticationType,
      }),
      webauthnOptions: t.exposeString("webauthnOptions"),
      plexUser: t.expose("plexUser", { type: PlexUser }),
    }),
  });

  builder.objectType(PlexUser, {
    name: "PlexUser",
    fields: (t) => ({
      username: t.exposeString("username"),
      avatar: t.exposeString("avatar"),
    }),
  });

  builder.inputType("WebauthnInput", {
    fields: (t) => ({
      //   type: t.string(AuthenticationInput),
      verification: t.string({ required: true }),
      plexToken: t.string({ required: true }),
    }),
  });
};

export const AuthenticationInput = () =>
  builder.inputType("AuthenticationInput", {
    fields: (t) => ({
      plexToken: t.string({ required: true }),
    }),
  });
