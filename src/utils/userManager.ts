import { Code, ConnectError } from "@connectrpc/connect";
import type { HandlerContext } from "@connectrpc/connect";
import type { User } from "@prisma/client";
import type { Footer, Payload } from "paseto-ts/lib/types";
import { sign, verify } from "paseto-ts/v4";
import { prisma, redis } from "../lib/index.js";
import { generateCooke } from "./cookies.js";

export class UserManager {
  constructor(secret: string, publicKey: string) {
    this.secret = secret;
    this.publicKey = publicKey;
  }

  private pasetoToken?: string;
  private secret: string;
  private publicKey: string;
  public user: User;
  private userId: string;
  public tokenId: string;
  private verifiedUserToken: {
    payload: Payload;
    footer?: Footer | string;
  };

  public setToken(token: string) {
    this.pasetoToken = token;
  }

  public setUserId(id: string) {
    this.userId = id;
  }

  public generateToken(id: string) {
    if (!this.userId) {
      throw new ConnectError(
        "User ID not specified for token generation",
        Code.FailedPrecondition,
      );
    }

    try {
      return sign(
        this.secret,
        {
          iss: process.env.RP_NAME,
          jti: id,
          aud: this.userId,
          exp: "7d",
        },
        {},
      );
    } catch (err) {
      throw new ConnectError(`Failed to generate token: ${err}`, Code.Internal);
    }
  }

  public async verifyToken(ctx: HandlerContext) {
    if (!this.pasetoToken) {
      throw new ConnectError(
        "No token provided with request",
        Code.Unauthenticated,
      );
    }

    try {
      this.verifiedUserToken = verify(this.publicKey, this.pasetoToken);

      if (!this.verifiedUserToken.payload.jti) {
        throw new ConnectError(
          "Token does not contain a jti",
          Code.InvalidArgument,
        );
      }

      this.tokenId = this.verifiedUserToken.payload.jti;

      const tokenRecord = await redis
        .get(`token:${this.verifiedUserToken.payload.jti}`)
        .catch((err) => {
          throw new ConnectError(
            `Failed to get token from redis: ${err}`,
            Code.Internal,
          );
        });

      if (!tokenRecord) {
        throw new ConnectError(
          "Token not registered with server",
          Code.NotFound,
        );
      }

      const user = await prisma.user
        .findUnique({
          where: {
            id: tokenRecord,
          },
        })
        .catch((err) => {
          throw new ConnectError(`Failed to find user: ${err}`, Code.Internal);
        });

      if (tokenRecord !== this.verifiedUserToken.payload.aud) {
        throw new ConnectError(
          "Token does not belong to specified user",
          Code.PermissionDenied,
        );
      }

      if (!user) {
        throw new ConnectError("User not found", Code.NotFound);
      }

      this.user = user;
    } catch (err) {
      this.forceExpireCookie(ctx);

      throw new ConnectError(
        `Failed to verify token: ${err}`,
        Code.Unauthenticated,
      );
    }
  }

  private forceExpireCookie(ctx: HandlerContext) {
    const cookie = generateCooke("Token", "", 0);
    ctx.responseHeader.set("Set-Cookie", cookie.toString());
  }
}
