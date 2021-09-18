/*
  Warnings:

  - The values [TEMPORARY] on the enum `TokenType` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `clientPassword` to the `TorrentClient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clientUrl` to the `TorrentClient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clientUsername` to the `TorrentClient` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TokenType_new" AS ENUM ('ACCESS', 'REFRESH');
ALTER TABLE "Token" ALTER COLUMN "type" TYPE "TokenType_new" USING ("type"::text::"TokenType_new");
ALTER TYPE "TokenType" RENAME TO "TokenType_old";
ALTER TYPE "TokenType_new" RENAME TO "TokenType";
DROP TYPE "TokenType_old";
COMMIT;

-- AlterTable
ALTER TABLE "TorrentClient" ADD COLUMN     "clientPassword" TEXT NOT NULL,
ADD COLUMN     "clientUrl" TEXT NOT NULL,
ADD COLUMN     "clientUsername" TEXT NOT NULL;
