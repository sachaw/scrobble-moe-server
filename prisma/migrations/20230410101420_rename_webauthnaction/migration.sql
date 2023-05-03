/*
  Warnings:

  - The `challangeUsage` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "WebauthnAction" AS ENUM ('AUTHENTICATION', 'REGISTRATION');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "challangeUsage",
ADD COLUMN     "challangeUsage" "WebauthnAction";

-- DropEnum
DROP TYPE "ChallangeUsage";
