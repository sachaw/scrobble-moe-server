/*
  Warnings:

  - You are about to drop the column `lastPlexPin` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "LinkedAccount" DROP CONSTRAINT "LinkedAccount_userId_fkey";

-- DropForeignKey
ALTER TABLE "Scrobble" DROP CONSTRAINT "Scrobble_serverId_fkey";

-- DropForeignKey
ALTER TABLE "Scrobble" DROP CONSTRAINT "Scrobble_userId_fkey";

-- DropForeignKey
ALTER TABLE "SeriesSubscription" DROP CONSTRAINT "SeriesSubscription_encoderId_fkey";

-- DropForeignKey
ALTER TABLE "SeriesSubscription" DROP CONSTRAINT "SeriesSubscription_userId_fkey";

-- DropForeignKey
ALTER TABLE "Token" DROP CONSTRAINT "Token_userId_fkey";

-- DropForeignKey
ALTER TABLE "TorrentClient" DROP CONSTRAINT "TorrentClient_userId_fkey";

-- DropIndex
DROP INDEX "User.lastPlexPin_unique";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "lastPlexPin";

-- AddForeignKey
ALTER TABLE "Token" ADD CONSTRAINT "Token_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scrobble" ADD CONSTRAINT "Scrobble_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scrobble" ADD CONSTRAINT "Scrobble_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "Server"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LinkedAccount" ADD CONSTRAINT "LinkedAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TorrentClient" ADD CONSTRAINT "TorrentClient_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeriesSubscription" ADD CONSTRAINT "SeriesSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeriesSubscription" ADD CONSTRAINT "SeriesSubscription_encoderId_fkey" FOREIGN KEY ("encoderId") REFERENCES "Encoder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "Authenticator.credentialID_unique" RENAME TO "Authenticator_credentialID_key";

-- RenameIndex
ALTER INDEX "LinkedAccount.accountId_unique" RENAME TO "LinkedAccount_accountId_key";

-- RenameIndex
ALTER INDEX "Server.secret_unique" RENAME TO "Server_secret_key";

-- RenameIndex
ALTER INDEX "Server.uuid_unique" RENAME TO "Server_uuid_key";

-- RenameIndex
ALTER INDEX "Token.hashedToken_unique" RENAME TO "Token_hashedToken_key";

-- RenameIndex
ALTER INDEX "User.email_unique" RENAME TO "User_email_key";

-- RenameIndex
ALTER INDEX "User.plexId_unique" RENAME TO "User_plexId_key";

-- RenameIndex
ALTER INDEX "User.plexUUID_unique" RENAME TO "User_plexUUID_key";
