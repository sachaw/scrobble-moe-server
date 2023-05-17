/*
  Warnings:

  - You are about to drop the column `challangeUsage` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "challangeUsage";

-- DropEnum
DROP TYPE "WebauthnAction";
