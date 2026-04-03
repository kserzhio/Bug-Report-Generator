-- CreateEnum
CREATE TYPE "SavedViewVisibility" AS ENUM ('PRIVATE', 'WORKSPACE');

-- AlterTable
ALTER TABLE "SavedView" ADD COLUMN     "visibility" "SavedViewVisibility" NOT NULL DEFAULT 'PRIVATE';

-- CreateIndex
CREATE INDEX "SavedView_workspaceId_scope_visibility_createdAt_idx" ON "SavedView"("workspaceId", "scope", "visibility", "createdAt");
