import { Code, ConnectError, HandlerContext } from "@connectrpc/connect";
import { User } from "@prisma/client";
import { sign, verify } from "paseto-ts/v4";
import { CookieBuilder } from "patissier";
import { prisma } from "../lib/prisma.js";
import { redis } from "../lib/redis.js";

/**
 * Shim pending: https://github.com/auth70/paseto-ts/pull/4
 */
export interface Payload {
  // rome-ignore lint/suspicious/noExplicitAny: <explanation>
  [key: string]: any;
  iss?: string;
  sub?: string;
  aud?: string;
  exp?: string;
  nbf?: string;
  jti?: string;
  iat?: string;
}

export interface Footer {
  // rome-ignore lint/suspicious/noExplicitAny: <explanation>
  [key: string]: any;
  kid?: string;
  wpk?: string;
}

export class UserManager {
  constructor(secret: string, publicKey: string) {
    this.secret = secret;
    this.publicKey = publicKey;
  }

  private PASETOToken?: string;
  private secret: string;
  private publicKey: string;
  public user: User;
  private userID: string;
  public tokenId: string;
  private verifiedUserToken: {
    payload: Payload;
    footer?: Footer | string;
  };

  public setToken(token: string) {
    this.PASETOToken = token;
  }

  public setUserID(id: string) {
    this.userID = id;
  }

  public generateToken(id: string) {
    if (!this.userID)
      throw new ConnectError(
        "User ID not specified for token generation",
        Code.FailedPrecondition,
      );

    try {
      return sign(
        this.secret,
        {
          iss: process.env.RP_NAME,
          jti: id,
          aud: this.userID,
          exp: "7d",
        },
        {},
      );
    } catch (err) {
      throw new ConnectError(`Failed to generate token: ${err}`, Code.Internal);
    }
  }

  public async verifyToken(ctx: HandlerContext) {
    if (!this.PASETOToken) {
      throw new ConnectError(
        "No token provided with request",
        Code.Unauthenticated,
      );
    }

    console.log("has token");

    try {
      this.verifiedUserToken = verify(this.publicKey, this.PASETOToken);

      console.log("verified");

      if (!this.verifiedUserToken.payload.jti) {
        throw new ConnectError(
          "Token does not contain a jti",
          Code.InvalidArgument,
        );
      }

      console.log("catch1");

      this.tokenId = this.verifiedUserToken.payload.jti;

      console.log("catchtmp2");

      const tokenRecord = await redis
        .get(`token:${this.verifiedUserToken.payload.jti}`)
        .catch((err) => {
          console.log(err);

          throw new ConnectError(
            `Failed to get token from redis: ${err}`,
            Code.Internal,
          );
        });

      if (!tokenRecord)
        throw new ConnectError(
          "Token not registered with server",
          Code.NotFound,
        );

      console.log("catch2");

      const user = await prisma.user
        .findUnique({
          where: {
            id: tokenRecord,
          },
        })
        .catch((err) => {
          console.log(err);

          throw new ConnectError(`Failed to find user: ${err}`, Code.Internal);
        });

      console.log("catchtmp");

      if (tokenRecord !== this.verifiedUserToken.payload.aud) {
        throw new ConnectError(
          "Token does not belong to specified user",
          Code.PermissionDenied,
        );
      }

      console.log("catch3");

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

    console.log("catch4");
  }

  private forceExpireCookie(ctx: HandlerContext) {
    const cookie = new CookieBuilder()
      .name("Token")
      .value("")
      .httpOnly()
      .path("/")
      .expires(new Date())
      .build();

    ctx.responseHeader.set("Set-Cookie", cookie.toString());
  }
}
