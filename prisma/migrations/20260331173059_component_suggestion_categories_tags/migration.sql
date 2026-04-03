-- AlterTable
ALTER TABLE "ComponentIssueSuggestion" ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'general',
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateIndex
CREATE INDEX "ComponentIssueSuggestion_workspaceId_category_idx" ON "ComponentIssueSuggestion"("workspaceId", "category");
