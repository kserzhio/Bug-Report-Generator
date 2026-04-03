-- CreateEnum
CREATE TYPE "SavedViewScope" AS ENUM ('HISTORY', 'LIBRARY');

-- CreateTable
CREATE TABLE "SavedView" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "scope" "SavedViewScope" NOT NULL,
  "name" TEXT NOT NULL,
  "queryString" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "SavedView_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SavedView_workspaceId_userId_scope_idx" ON "SavedView"("workspaceId", "userId", "scope");

-- CreateIndex
CREATE INDEX "SavedView_workspaceId_scope_createdAt_idx" ON "SavedView"("workspaceId", "scope", "createdAt");

-- AddForeignKey
ALTER TABLE "SavedView" ADD CONSTRAINT "SavedView_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedView" ADD CONSTRAINT "SavedView_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;