/*
  Warnings:

  - You are about to drop the column `plexUUID` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "User_plexUUID_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "plexUUID";
