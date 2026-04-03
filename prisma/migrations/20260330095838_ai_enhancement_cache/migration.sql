-- CreateTable
CREATE TABLE "AiEnhancementCache" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cacheKey" TEXT NOT NULL,
    "promptVersion" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "confidenceScore" DOUBLE PRECISION NOT NULL,
    "wcagCriterion" TEXT NOT NULL,
    "actualBehavior" TEXT NOT NULL,
    "expectedBehavior" TEXT NOT NULL,
    "affectedUsers" TEXT NOT NULL,
    "problem" TEXT NOT NULL,
    "whyItMatters" TEXT NOT NULL,
    "howToFix" TEXT[],
    "codeExample" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiEnhancementCache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AiEnhancementCache_workspaceId_createdAt_idx" ON "AiEnhancementCache"("workspaceId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "AiEnhancementCache_workspaceId_cacheKey_key" ON "AiEnhancementCache"("workspaceId", "cacheKey");

-- AddForeignKey
ALTER TABLE "AiEnhancementCache" ADD CONSTRAINT "AiEnhancementCache_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiEnhancementCache" ADD CONSTRAINT "AiEnhancementCache_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
