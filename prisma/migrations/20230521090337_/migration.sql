/*
  Warnings:

  - You are about to drop the column `challenge` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `challengeExpiresAt` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "challenge",
DROP COLUMN "challengeExpiresAt";
