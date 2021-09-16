import { sign } from "jsonwebtoken";
import { AuthChecker } from "type-graphql";

import { PrismaClient, User } from "@prisma/client";

import { TokenResponse } from "../auth/auth";
import { Context } from "../lib/context";
import { env } from "../lib/env";

export const generateTokens = async (prisma: PrismaClient, user: User): Promise<TokenResponse> => {
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
        env.JWT_SECRET
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
        env.JWT_SECRET
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

// export const generateTemporaryToken = async (
//   prisma: PrismaClient,
//   user: User
// ): Promise<TemporaryTokenResponse> => {
//   const tokenExpires = new Date(new Date().getTime() + 1000 * 60 * 1); // 1 minute

//   // remove old temporary tokens
//   await prisma.token.deleteMany({
//     where: {
//       AND: {
//         user: {
//           id: user.id,
//         },
//         type: "TEMPORARY",
//       },
//     },
//   });

//   const token = await prisma.token.create({
//     data: {
//       userId: user.id,
//       type: "TEMPORARY",
//       hashedToken: sign(
//         {
//           exp: tokenExpires.getTime(),
//           sub: user.id,
//           type: "temporary",
//         },
//         env.JWT_SECRET
//       ),
//       expiresAt: tokenExpires,
//     },
//   });

//   return {
//     token: token.hashedToken,
//     tokenExpires: token.createdAt,
//   };
// };

export const authCheck: AuthChecker<Context> = ({ root, args, context, info }, roles) => {
  const { user } = context;

  if (!user) {
    return false;
  }

  if (roles.find((r) => r === user.role)) {
    return true;
  }

  return false;
};
