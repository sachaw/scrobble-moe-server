import axios from "axios";
import { sign } from "jsonwebtoken";
import { PlexOauth } from "plex-oauth";
import { Arg, Ctx, Query, Resolver } from "type-graphql";

import { Context } from "../";
import { PlexLoginUrl, PlexPinResponse } from "./auth";

@Resolver(PlexLoginUrl)
export class AuthResolver {
  constructor(private plexOauth: PlexOauth) {
    this.plexOauth = new PlexOauth({
      origin: "http://localhost:4000",
      clientIdentifier: "7f9de3ba-e12b-11ea-87d0-0242ac130003",
      product: "scrobble.moe",
      device: "Internet",
      version: "1",
      forwardUrl: "",
    });
  }

  @Query(() => [PlexLoginUrl])
  async plexLoginURL() {
    const [url, token] = await this.plexOauth.requestHostedLoginURL();
    return [
      {
        url,
        token,
      },
    ];
  }

  @Query(() => [PlexPinResponse])
  async pinCheck(@Ctx() ctx: Context, @Arg("pin") pin: number) {
    const token = await this.plexOauth.checkForAuthToken(pin);

    if (!token) {
      return null;
    }

    axios
      .get("https://plex.tv/users/account.json", {
        headers: {
          "X-Plex-Token": token ?? "",
          Accept: "application/json",
        },
      })
      .then(async (response) => {
        const user = await ctx.prisma.user.upsert({
          where: {
            plexUUID: response.data.user.uuid,
          },
          update: {
            email: response.data.user.email,
            plexAuthToken: token,
            thumb: response.data.user.thumb,
            username: response.data.user.username,
          },
          create: {
            email: response.data.user.email,
            plexAuthToken: token,
            plexId: response.data.user.id,
            plexUUID: response.data.user.uuid,
            thumb: response.data.user.thumb,
            username: response.data.user.username,
          },
        });

        const accessTokenExpires = new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 3);
        const refreshTokenExpires = new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 40);

        const accessToken = await ctx.prisma.token.create({
          data: {
            userId: user.id,
            type: "ACCESS",
            hashedToken: sign(
              {
                exp: accessTokenExpires.getTime(),
                sub: user.id,
                type: "access",
              },
              process.env.JWT_SECRET
            ),
            expiresAt: accessTokenExpires,
          },
        });

        const refreshToken = await ctx.prisma.token.create({
          data: {
            userId: user.id,
            type: "REFRESH",
            hashedToken: sign(
              {
                exp: refreshTokenExpires.getTime(),
                sub: user.id,
                type: "refresh",
              },
              process.env.JWT_SECRET
            ),
            expiresAt: refreshTokenExpires,
          },
        });

        console.log(accessToken);
        console.log(refreshToken);

        return [
          {
            accessToken: accessToken.hashedToken,
            accessTokenExpires: accessToken.createdAt,
            refreshToken: refreshToken.hashedToken,
            refreshTokenExpires: refreshToken.createdAt,
          },
        ];
      });
  }
}
