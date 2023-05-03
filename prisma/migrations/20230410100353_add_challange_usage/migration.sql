/*
  Warnings:

  - You are about to drop the column `authenticationChallenge` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `authenticationChallengeExpiresAt` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ChallangeUsage" AS ENUM ('AUTHENTICATION', 'REGISTRATION');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "authenticationChallenge",
DROP COLUMN "authenticationChallengeExpiresAt",
ADD COLUMN     "challangeUsage" "ChallangeUsage",
ADD COLUMN     "challenge" TEXT,
ADD COLUMN     "challengeExpiresAt" TIMESTAMP(3);
