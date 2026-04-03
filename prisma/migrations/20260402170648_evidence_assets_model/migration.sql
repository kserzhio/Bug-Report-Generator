-- CreateTable
CREATE TABLE "EvidenceAsset" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "generatedBugId" TEXT,
    "reusableBugId" TEXT,
    "url" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EvidenceAsset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EvidenceAsset_workspaceId_userId_createdAt_idx" ON "EvidenceAsset"("workspaceId", "userId", "createdAt");

-- CreateIndex
CREATE INDEX "EvidenceAsset_generatedBugId_idx" ON "EvidenceAsset"("generatedBugId");

-- CreateIndex
CREATE INDEX "EvidenceAsset_reusableBugId_idx" ON "EvidenceAsset"("reusableBugId");

-- CreateIndex
CREATE UNIQUE INDEX "EvidenceAsset_workspaceId_userId_url_key" ON "EvidenceAsset"("workspaceId", "userId", "url");

-- AddForeignKey
ALTER TABLE "EvidenceAsset" ADD CONSTRAINT "EvidenceAsset_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceAsset" ADD CONSTRAINT "EvidenceAsset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceAsset" ADD CONSTRAINT "EvidenceAsset_generatedBugId_fkey" FOREIGN KEY ("generatedBugId") REFERENCES "GeneratedBug"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceAsset" ADD CONSTRAINT "EvidenceAsset_reusableBugId_fkey" FOREIGN KEY ("reusableBugId") REFERENCES "ReusableBug"("id") ON DELETE SET NULL ON UPDATE CASCADE;
