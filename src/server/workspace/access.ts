import { prisma } from "@/lib/prisma/client";
import { normalizeWorkspaceRole, roleAtLeast, type WorkspaceRole } from "@/src/server/workspace/roles";

export type WorkspaceAccess = {
  workspaceId: string;
  role: WorkspaceRole;
};

export async function getWorkspaceAccessForUser(userId: string, workspaceId: string) {
  const membership = await prisma.workspaceMember.findFirst({
    where: {
      userId,
      workspaceId
    },
    select: {
      workspaceId: true,
      role: true
    }
  });

  if (!membership) {
    return null;
  }

  return {
    workspaceId: membership.workspaceId,
    role: normalizeWorkspaceRole(membership.role)
  } satisfies WorkspaceAccess;
}

export async function getDefaultWorkspaceAccessForUser(userId: string) {
  const membership = await prisma.workspaceMember.findFirst({
    where: { userId },
    orderBy: { createdAt: "asc" },
    select: {
      workspaceId: true,
      role: true
    }
  });

  if (!membership) {
    return null;
  }

  return {
    workspaceId: membership.workspaceId,
    role: normalizeWorkspaceRole(membership.role)
  } satisfies WorkspaceAccess;
}

export function ensureWorkspaceRole(role: WorkspaceRole, minimum: WorkspaceRole) {
  return roleAtLeast(role, minimum);
}