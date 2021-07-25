import { sign } from "jsonwebtoken";

import { PrismaClient, User } from "@prisma/client";

export const generateTokens = async (prisma: PrismaClient, user: User) => {
  const accessTokenExpires = new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 3); // 3 days
  const refreshTokenExpires = new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 40); // 40 days

  // remove expired tokens
  await prisma.token.deleteMany({
    where: {
      AND: {
        user: {
          id: user.id,
        },
        expiresAt: {
          lt: new Date(),
        },
      },
    },
  });

  const accessToken = await prisma.token.create({
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

  const refreshToken = await prisma.token.create({
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

  return {
    accessToken: accessToken.hashedToken,
    accessTokenExpires: accessToken.createdAt,
    refreshToken: refreshToken.hashedToken,
    refreshTokenExpires: refreshToken.createdAt,
  };
};

export const generateTemporaryToken = async (prisma: PrismaClient, user: User) => {
  const tokenExpires = new Date(new Date().getTime() + 1000 * 60 * 1); // 1 minute

  // remove old temporary tokens
  await prisma.token.deleteMany({
    where: {
      AND: {
        user: {
          id: user.id,
        },
        type: "TEMPORARY",
      },
    },
  });

  const token = await prisma.token.create({
    data: {
      userId: user.id,
      type: "TEMPORARY",
      hashedToken: sign(
        {
          exp: tokenExpires.getTime(),
          sub: user.id,
          type: "temporary",
        },
        process.env.JWT_SECRET
      ),
      expiresAt: tokenExpires,
    },
  });

  return {
    token: token.hashedToken,
    tokenExpires: token.createdAt,
  };
};
