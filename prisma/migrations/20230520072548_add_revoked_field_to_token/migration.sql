/*
  Warnings:

  - You are about to drop the column `hashedToken` on the `Token` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Token_hashedToken_key";

-- AlterTable
ALTER TABLE "Token" DROP COLUMN "hashedToken",
ADD COLUMN     "revoked" BOOLEAN NOT NULL DEFAULT false;
