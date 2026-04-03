-- CreateEnum
CREATE TYPE "AuditEventType" AS ENUM ('WORKSPACE_UPDATED', 'MEMBER_INVITED', 'INVITE_REVOKED', 'MEMBER_ROLE_UPDATED', 'MEMBER_REMOVED', 'WORKSPACE_SWITCHED', 'BUG_SAVED', 'BUG_UPDATED', 'LIBRARY_ITEM_SAVED', 'LIBRARY_ITEM_DELETED', 'HISTORY_BULK_DELETED', 'HISTORY_BULK_ASSIGNED', 'LIBRARY_BULK_DELETED', 'SAVED_VIEW_CREATED', 'SAVED_VIEW_DELETED', 'BILLING_CHECKOUT_CREATED', 'BILLING_PORTAL_OPENED');

-- CreateTable
CREATE TABLE "WorkspaceAuditEvent" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "actorUserId" TEXT,
    "eventType" "AuditEventType" NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "message" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkspaceAuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WorkspaceAuditEvent_workspaceId_createdAt_idx" ON "WorkspaceAuditEvent"("workspaceId", "createdAt");

-- CreateIndex
CREATE INDEX "WorkspaceAuditEvent_workspaceId_eventType_createdAt_idx" ON "WorkspaceAuditEvent"("workspaceId", "eventType", "createdAt");

-- AddForeignKey
ALTER TABLE "WorkspaceAuditEvent" ADD CONSTRAINT "WorkspaceAuditEvent_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceAuditEvent" ADD CONSTRAINT "WorkspaceAuditEvent_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
