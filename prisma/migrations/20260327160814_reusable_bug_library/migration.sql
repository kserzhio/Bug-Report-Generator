-- CreateTable
CREATE TABLE "ReusableBug" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "tags" TEXT[],
    "issueType" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "component" TEXT NOT NULL,
    "screenName" TEXT NOT NULL,
    "affectedUsers" TEXT NOT NULL,
    "actualBehavior" TEXT NOT NULL,
    "expectedBehavior" TEXT NOT NULL,
    "wcagCriterion" TEXT NOT NULL,
    "toolsUsed" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReusableBug_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReusableBug_workspaceId_category_idx" ON "ReusableBug"("workspaceId", "category");

-- CreateIndex
CREATE INDEX "ReusableBug_workspaceId_createdAt_idx" ON "ReusableBug"("workspaceId", "createdAt");

-- AddForeignKey
ALTER TABLE "ReusableBug" ADD CONSTRAINT "ReusableBug_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReusableBug" ADD CONSTRAINT "ReusableBug_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
