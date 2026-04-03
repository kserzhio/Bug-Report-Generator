import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { BILLING_PLANS } from "@/lib/billing/plans";
import { prisma } from "@/lib/prisma/client";
import { formatBugReport } from "@/src/domain/services/bug-report-service";
import { inferWcagVersion } from "@/src/domain/services/wcag-options";
import { getDefaultWorkspaceAccessForUser, getWorkspaceAccessForUser } from "@/src/server/workspace/access";
import { normalizeWorkspaceRole, type WorkspaceRole } from "@/src/server/workspace/roles";
import type { GeneratorFormValues } from "@/src/validation/generator";

function getMonthStart() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

type WorkspaceScope = {
  userId: string;
  workspaceId: string;
  role: WorkspaceRole;
};

async function resolveWorkspaceScope(): Promise<WorkspaceScope> {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const userId = session.user.id;
  const requestedWorkspaceId = session.user.workspaceId ?? null;

  const directAccess = requestedWorkspaceId
    ? await getWorkspaceAccessForUser(userId, requestedWorkspaceId)
    : null;
  const access = directAccess ?? (await getDefaultWorkspaceAccessForUser(userId));

  if (!access) {
    redirect("/sign-in");
  }

  if (!requestedWorkspaceId || requestedWorkspaceId !== access.workspaceId) {
    await prisma.user.update({
      where: { id: userId },
      data: { defaultWorkspaceId: access.workspaceId }
    });
  }

  return {
    userId,
    workspaceId: access.workspaceId,
    role: access.role
  };
}

export async function getCurrentWorkspaceContext() {
  const scope = await resolveWorkspaceScope();

  const [workspace, subscription, monthlyGenerations, memberships, pendingInvites, auditEvents] = await Promise.all([
    prisma.workspace.findUnique({
      where: { id: scope.workspaceId },
      include: {
        projects: {
          orderBy: { createdAt: "desc" }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: [{ role: "asc" }, { createdAt: "asc" }]
        }
      }
    }),
    prisma.subscription.findFirst({
      where: {
        workspaceId: scope.workspaceId,
        userId: scope.userId
      },
      orderBy: { createdAt: "desc" }
    }),
    prisma.generatedBug.count({
      where: {
        workspaceId: scope.workspaceId,
        createdAt: {
          gte: getMonthStart()
        }
      }
    }),
    prisma.workspaceMember.findMany({
      where: { userId: scope.userId },
      include: {
        workspace: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      },
      orderBy: { createdAt: "asc" }
    }),
    prisma.workspaceInvite.findMany({
      where: {
        workspaceId: scope.workspaceId,
        acceptedAt: null,
        expiresAt: { gt: new Date() }
      },
      include: {
        invitedBy: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    }),
    prisma.workspaceAuditEvent.findMany({
      where: { workspaceId: scope.workspaceId },
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 25
    })
  ]);

  if (!workspace) {
    redirect("/sign-in");
  }

  const planKey = subscription?.plan === "PRO" ? "pro" : "free";
  const plan = BILLING_PLANS[planKey];

  return {
    currentUserId: scope.userId,
    workspace,
    subscription,
    plan,
    currentRole: scope.role,
    memberships: memberships.map((membership) => ({
      workspaceId: membership.workspaceId,
      workspaceName: membership.workspace.name,
      workspaceSlug: membership.workspace.slug,
      role: normalizeWorkspaceRole(membership.role)
    })),
    pendingInvites,
    auditEvents,
    monthlyGenerations,
    remainingGenerations:
      plan.generationLimit === null
        ? null
        : Math.max(plan.generationLimit - monthlyGenerations, 0)
  };
}

export async function getGeneratorInitialValues(params: {
  bugId?: string;
  duplicateId?: string;
  templateId?: string;
  projectId?: string;
  libraryId?: string;
}): Promise<GeneratorFormValues> {
  const scope = await resolveWorkspaceScope();
  const defaultWcagCriterion = "2.4.7 Focus Visible";
  const defaults: GeneratorFormValues = {
    bugId: "",
    issueType: "Accessibility",
    severity: "High",
    wcagVersion: "2.2",
    component: "Search input",
    screenName: "Checkout page",
    affectedUsers: "Keyboard and screen reader users",
    actualBehavior:
      "The control receives focus, but there is no visible indicator and its purpose is not announced correctly by assistive technologies.",
    expectedBehavior:
      "The control should expose a clear accessible name and display a strong visible focus state when focused.",
    wcagCriterion: defaultWcagCriterion,
    toolsUsed: "NVDA, keyboard-only testing, Axe DevTools",
    reproductionSteps: "",
    browserInfo: "",
    operatingSystem: "",
    deviceInfo: "",
    assistiveTechnology: "",
    videoUrl: "",
    screenshotUrls: "",
    notes: "Reproduced in Chrome 134 on Windows 11.",
    projectId: params.projectId ?? ""
  };

  if (params.bugId || params.duplicateId) {
    const id = params.bugId ?? params.duplicateId;

    const bug = await prisma.generatedBug.findFirst({
      where: {
        id,
        workspaceId: scope.workspaceId
      }
    });

    if (bug) {
      return {
        bugId: params.bugId ? bug.id : "",
        issueType: bug.issueType as GeneratorFormValues["issueType"],
        severity: bug.severity as GeneratorFormValues["severity"],
        wcagVersion: (bug.wcagVersion as GeneratorFormValues["wcagVersion"]) ?? inferWcagVersion(bug.wcagCriterion),
        projectId: params.projectId ?? bug.projectId ?? "",
        component: bug.component,
        screenName: bug.screenName,
        affectedUsers: bug.affectedUsers,
        actualBehavior: bug.actualBehavior,
        expectedBehavior: bug.expectedBehavior,
        wcagCriterion: bug.wcagCriterion,
        toolsUsed: bug.toolsUsed,
        reproductionSteps: bug.reproductionSteps ?? "",
        browserInfo: bug.browserInfo ?? "",
        operatingSystem: bug.operatingSystem ?? "",
        deviceInfo: bug.deviceInfo ?? "",
        assistiveTechnology: bug.assistiveTechnology ?? "",
        videoUrl: bug.videoUrl ?? "",
        screenshotUrls: bug.screenshotUrls ?? "",
        notes: bug.notes ?? ""
      };
    }
  }

  if (params.libraryId) {
    const item = await prisma.reusableBug.findFirst({
      where: {
        id: params.libraryId,
        workspaceId: scope.workspaceId
      }
    });

    if (item) {
      return {
        ...defaults,
        issueType: item.issueType as GeneratorFormValues["issueType"],
        severity: item.severity as GeneratorFormValues["severity"],
        wcagVersion: (item.wcagVersion as GeneratorFormValues["wcagVersion"]) ?? inferWcagVersion(item.wcagCriterion),
        component: item.component,
        screenName: item.screenName,
        affectedUsers: item.affectedUsers,
        actualBehavior: item.actualBehavior,
        expectedBehavior: item.expectedBehavior,
        wcagCriterion: item.wcagCriterion,
        toolsUsed: item.toolsUsed,
        reproductionSteps: item.reproductionSteps ?? "",
        browserInfo: item.browserInfo ?? "",
        operatingSystem: item.operatingSystem ?? "",
        deviceInfo: item.deviceInfo ?? "",
        assistiveTechnology: item.assistiveTechnology ?? "",
        videoUrl: item.videoUrl ?? "",
        screenshotUrls: item.screenshotUrls ?? "",
        notes: item.notes ?? ""
      };
    }
  }

  if (params.templateId) {
    const template = await prisma.bugTemplate.findFirst({
      where: {
        id: params.templateId,
        OR: [{ workspaceId: scope.workspaceId }, { isSystem: true }]
      }
    });

    if (template) {
      return {
        ...defaults,
        issueType: template.issueType as GeneratorFormValues["issueType"],
        severity: template.severity as GeneratorFormValues["severity"],
        wcagVersion: (template.wcagVersion as GeneratorFormValues["wcagVersion"]) ?? inferWcagVersion(template.wcagCriterion),
        component: template.component ?? defaults.component,
        screenName: template.screenName ?? defaults.screenName,
        affectedUsers: template.affectedUsers ?? defaults.affectedUsers,
        actualBehavior: template.actualBehavior,
        expectedBehavior: template.expectedBehavior,
        wcagCriterion: template.wcagCriterion,
        toolsUsed: template.toolsUsed,
        reproductionSteps: "",
        browserInfo: "",
        operatingSystem: "",
        deviceInfo: "",
        assistiveTechnology: "",
        videoUrl: "",
        screenshotUrls: "",
        notes: template.notes ?? template.description
      };
    }
  }

  return defaults;
}

export function buildMarkdownPreview(values: GeneratorFormValues) {
  return formatBugReport(values);
}
