/*
  Warnings:

  - You are about to drop the column `status` on the `Scrobble` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Scrobble" DROP COLUMN "status";

-- CreateTable
CREATE TABLE "ScrobbleProviderStatus" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" "ScrobbleStatus" NOT NULL,
    "provider" "Provider" NOT NULL,
    "scrobbleId" TEXT NOT NULL,

    CONSTRAINT "ScrobbleProviderStatus_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ScrobbleProviderStatus" ADD CONSTRAINT "ScrobbleProviderStatus_scrobbleId_fkey" FOREIGN KEY ("scrobbleId") REFERENCES "Scrobble"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
