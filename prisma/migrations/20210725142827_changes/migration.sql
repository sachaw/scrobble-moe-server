/*
  Warnings:

  - Added the required column `AAGUID` to the `Authenticator` table without a default value. This is not possible if the table is not empty.
  - Added the required column `revoked` to the `Authenticator` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Server` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "TokenType" ADD VALUE 'TEMPORARY';

-- AlterTable
ALTER TABLE "Authenticator" ADD COLUMN     "AAGUID" TEXT NOT NULL,
ADD COLUMN     "revoked" BOOLEAN NOT NULL;

-- AlterTable
ALTER TABLE "Server" ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "authenticationChallenge" TEXT,
ADD COLUMN     "authenticationChallengeExpiresAt" TIMESTAMP(3);
