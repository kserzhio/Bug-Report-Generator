-- CreateTable
CREATE TABLE "ComponentIssueSuggestion" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT,
    "slug" TEXT NOT NULL,
    "componentKey" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "affectedUsers" TEXT NOT NULL,
    "actualBehavior" TEXT NOT NULL,
    "expectedBehavior" TEXT NOT NULL,
    "wcagCriterion" TEXT NOT NULL,
    "notes" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ComponentIssueSuggestion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ComponentIssueSuggestion_slug_key" ON "ComponentIssueSuggestion"("slug");

-- CreateIndex
CREATE INDEX "ComponentIssueSuggestion_workspaceId_componentKey_idx" ON "ComponentIssueSuggestion"("workspaceId", "componentKey");

-- CreateIndex
CREATE INDEX "ComponentIssueSuggestion_isSystem_componentKey_idx" ON "ComponentIssueSuggestion"("isSystem", "componentKey");

-- AddForeignKey
ALTER TABLE "ComponentIssueSuggestion" ADD CONSTRAINT "ComponentIssueSuggestion_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
