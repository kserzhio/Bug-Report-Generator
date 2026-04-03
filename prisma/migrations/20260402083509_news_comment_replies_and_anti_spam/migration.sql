-- AlterTable
ALTER TABLE "NewsComment" ADD COLUMN     "ipHash" TEXT,
ADD COLUMN     "parentId" TEXT;

-- CreateIndex
CREATE INDEX "NewsComment_parentId_createdAt_idx" ON "NewsComment"("parentId", "createdAt");

-- CreateIndex
CREATE INDEX "NewsComment_ipHash_createdAt_idx" ON "NewsComment"("ipHash", "createdAt");

-- AddForeignKey
ALTER TABLE "NewsComment" ADD CONSTRAINT "NewsComment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "NewsComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
