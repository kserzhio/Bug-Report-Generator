export const WORKSPACE_ROLES = ["OWNER", "ADMIN", "MEMBER", "VIEWER"] as const;

export type WorkspaceRole = (typeof WORKSPACE_ROLES)[number];

export const ROLE_RANK: Record<WorkspaceRole, number> = {
  OWNER: 4,
  ADMIN: 3,
  MEMBER: 2,
  VIEWER: 1
};

export function normalizeWorkspaceRole(value: string | null | undefined): WorkspaceRole {
  const normalized = String(value ?? "").trim().toUpperCase();

  if (normalized === "OWNER" || normalized === "ADMIN" || normalized === "MEMBER" || normalized === "VIEWER") {
    return normalized;
  }

  return "MEMBER";
}

export function roleAtLeast(role: WorkspaceRole, minimum: WorkspaceRole) {
  return ROLE_RANK[role] >= ROLE_RANK[minimum];
}