-- AlterTable
ALTER TABLE "ScheduledPost" ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "platformPostId" TEXT;

-- AddForeignKey
ALTER TABLE "ScheduledPost" ADD CONSTRAINT "ScheduledPost_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
