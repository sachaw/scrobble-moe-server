/*
  Warnings:

  - Added the required column `friendlyName` to the `Authenticator` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Authenticator" ADD COLUMN     "friendlyName" TEXT NOT NULL;
