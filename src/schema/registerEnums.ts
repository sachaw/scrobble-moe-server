import {
  Provider,
  Role,
  ScrobbleStatus,
  TokenType,
  Transport,
  WebauthnAction,
} from "@prisma/client";

import { builder } from "../builder.js";

export const registerEnums = () => {
  builder.enumType(Provider, {
    name: "Provider",
  });
  builder.enumType(ScrobbleStatus, {
    name: "ScrobbleStatus",
  });
  builder.enumType(Transport, {
    name: "Transport",
  });

  builder.enumType(TokenType, {
    name: "TokenType",
  });
  builder.enumType(Role, {
    name: "Role",
  });
  builder.enumType(WebauthnAction, {
    name: "WebauthnAction",
  });
};
