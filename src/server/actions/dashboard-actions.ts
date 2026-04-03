"use server";

import { randomBytes } from "crypto";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { Prisma } from "@prisma/client";

import { runAiEnhancement } from "@/lib/ai/providers";
import { auth, signOut } from "@/lib/auth";
import { BILLING_PLANS } from "@/lib/billing/plans";
import { prisma } from "@/lib/prisma/client";
import { getStripeClient } from "@/lib/stripe/client";
import { formatBugReport } from "@/src/domain/services/bug-report-service";
import { generateInsights } from "@/src/domain/services/bug-insights-service";
import { inferWcagVersion } from "@/src/domain/services/wcag-options";
import { buildAiCacheKey } from "@/src/server/ai/cache-key";
import { AI_PROMPT_VERSION, buildAiEnhancementPrompt } from "@/src/server/ai/prompt-builder";
import { applyQualityLayer } from "@/src/server/ai/quality-layer";
import { getActionMessages } from "@/src/server/i18n/action-messages";
import { getWorkspaceLocale } from "@/src/server/i18n/workspace-locale";
import { ensureWorkspaceRole, getDefaultWorkspaceAccessForUser, getWorkspaceAccessForUser } from "@/src/server/workspace/access";
import { normalizeWorkspaceRole, type WorkspaceRole } from "@/src/server/workspace/roles";
import {
  type GeneratorFormValues,
  generatorSchema
} from "@/src/validation/generator";

export type ActionState = {
  success?: string;
  error?: string;
  url?: string;
  id?: string;
  inviteLink?: string;
};

export type AiEnhancementState = {
  provider?: string;
  error?: string;
  usedFallback?: boolean;
  fallbackReason?: string;
  qualityScore?: number;
  strategy?: "ai" | "rule-fallback";
  enhancement?: {
    wcagCriterion: string;
    actualBehavior: string;
    expectedBehavior: string;
    affectedUsers: string;
    problem: string;
    whyItMatters: string;
    howToFix: string[];
    codeExample: string;
    notes?: string;
    confidenceScore: number;
    cached: boolean;
  };
};

function monthStart() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

async function requireWorkspace() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const requestedWorkspaceId = session.user.workspaceId ?? null;
  const directAccess = requestedWorkspaceId
    ? await getWorkspaceAccessForUser(session.user.id, requestedWorkspaceId)
    : null;
  const access = directAccess ?? (await getDefaultWorkspaceAccessForUser(session.user.id));

  if (!access) {
    throw new Error("Unauthorized");
  }

  if (!requestedWorkspaceId || requestedWorkspaceId !== access.workspaceId) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { defaultWorkspaceId: access.workspaceId }
    });
  }

  const locale = await getWorkspaceLocale(access.workspaceId);

  return {
    userId: session.user.id,
    workspaceId: access.workspaceId,
    email: session.user.email ?? "",
    locale,
    role: access.role
  };
}

function hasRole(currentRole: WorkspaceRole, minimumRole: WorkspaceRole) {
  return ensureWorkspaceRole(currentRole, minimumRole);
}

function buildInviteToken() {
  return randomBytes(24).toString("hex");
}
function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 50);
}

type WorkspaceAuditEventType =
  | "WORKSPACE_UPDATED"
  | "MEMBER_INVITED"
  | "INVITE_REVOKED"
  | "MEMBER_ROLE_UPDATED"
  | "MEMBER_REMOVED"
  | "WORKSPACE_SWITCHED"
  | "BUG_SAVED"
  | "BUG_UPDATED"
  | "LIBRARY_ITEM_SAVED"
  | "LIBRARY_ITEM_DELETED"
  | "HISTORY_BULK_DELETED"
  | "HISTORY_BULK_ASSIGNED"
  | "LIBRARY_BULK_DELETED"
  | "SAVED_VIEW_CREATED"
  | "SAVED_VIEW_DELETED"
  | "BILLING_CHECKOUT_CREATED"
  | "BILLING_PORTAL_OPENED";

async function logWorkspaceAuditEvent(input: {
  workspaceId: string;
  actorUserId?: string | null;
  eventType: WorkspaceAuditEventType;
  entityType: string;
  entityId?: string | null;
  message: string;
  metadata?: Prisma.InputJsonValue;
}) {
  try {
    await prisma.workspaceAuditEvent.create({
      data: {
        workspaceId: input.workspaceId,
        actorUserId: input.actorUserId ?? null,
        eventType: input.eventType,
        entityType: input.entityType,
        entityId: input.entityId ?? null,
        message: input.message,
        metadata: input.metadata
      }
    });
  } catch {
    // Audit logging must never block user-facing actions.
  }
}

function collectEvidenceUrls(values: Pick<GeneratorFormValues, "videoUrl" | "screenshotUrls">) {
  const screenshotUrls = String(values.screenshotUrls ?? "")
    .split(/\n|,|\s+/g)
    .map((item) => item.trim())
    .filter((item) => item.startsWith("/uploads/evidence/") || /^https?:\/\//i.test(item));

  const videoUrl = String(values.videoUrl ?? "").trim();
  const all = videoUrl ? [videoUrl, ...screenshotUrls] : screenshotUrls;

  return Array.from(new Set(all));
}
function buildEnhancedCachePayload(
  base: GeneratorFormValues,
  enhancement: {
    wcagCriterion: string;
    actualBehavior: string;
    expectedBehavior: string;
    affectedUsers: string;
    notes?: string;
  }
): GeneratorFormValues {
  const nextWcagVersion = inferWcagVersion(enhancement.wcagCriterion);

  return {
    bugId: "",
    projectId: base.projectId,
    issueType: base.issueType,
    severity: base.severity,
    wcagVersion: nextWcagVersion,
    component: base.component,
    screenName: base.screenName,
    affectedUsers: enhancement.affectedUsers,
    actualBehavior: enhancement.actualBehavior,
    expectedBehavior: enhancement.expectedBehavior,
    wcagCriterion: enhancement.wcagCriterion,
    toolsUsed: base.toolsUsed,
    reproductionSteps: base.reproductionSteps ?? "",
    browserInfo: base.browserInfo ?? "",
    operatingSystem: base.operatingSystem ?? "",
    deviceInfo: base.deviceInfo ?? "",
    assistiveTechnology: base.assistiveTechnology ?? "",
    videoUrl: base.videoUrl ?? "",
    screenshotUrls: base.screenshotUrls ?? "",
    notes: enhancement.notes ?? base.notes ?? ""
  };
}
async function getPlanInfo(workspaceId: string, userId: string) {
  const [subscription, monthlyCount] = await Promise.all([
    prisma.subscription.findFirst({
      where: { workspaceId, userId },
      orderBy: { createdAt: "desc" }
    }),
    prisma.generatedBug.count({
      where: {
        workspaceId,
        createdAt: {
          gte: monthStart()
        }
      }
    })
  ]);

  const planKey = subscription?.plan === "PRO" ? "pro" : "free";
  const plan = BILLING_PLANS[planKey];

  return {
    planKey,
    plan,
    monthlyCount
  };
}

export async function enhanceBugWithAiAction(
  values: GeneratorFormValues
): Promise<AiEnhancementState> {
  const { userId, workspaceId, locale } = await requireWorkspace();
  const messages = getActionMessages(locale);

  try {
    const payload = generatorSchema.parse(values);
    const cacheKey = buildAiCacheKey(payload, AI_PROMPT_VERSION);
    const ruleInsight = generateInsights(payload);
    const cached = await prisma.aiEnhancementCache.findUnique({
      where: {
        workspaceId_cacheKey: {
          workspaceId,
          cacheKey
        }
      }
    });

    if (cached) {
      const cachedEnhancement = {
        wcagCriterion: cached.wcagCriterion,
        actualBehavior: cached.actualBehavior,
        expectedBehavior: cached.expectedBehavior,
        affectedUsers: cached.affectedUsers,
        problem: cached.problem,
        whyItMatters: cached.whyItMatters,
        howToFix: cached.howToFix,
        codeExample: cached.codeExample,
        notes: cached.notes ?? undefined,
        confidenceScore: cached.confidenceScore
      };

      const decision = applyQualityLayer(payload, cachedEnhancement, ruleInsight);

      return {
        provider: decision.usedFallback ? `${cached.provider} -> Rule fallback` : cached.provider,
        usedFallback: decision.usedFallback,
        fallbackReason: decision.reason,
        qualityScore: decision.quality.score,
        strategy: decision.strategy,
        enhancement: {
          ...decision.enhancement,
          cached: true
        }
      };
    }

    const result = await runAiEnhancement(buildAiEnhancementPrompt(payload));
    const decision = applyQualityLayer(payload, result.enhancement, ruleInsight);

    await prisma.aiEnhancementCache.upsert({
      where: {
        workspaceId_cacheKey: {
          workspaceId,
          cacheKey
        }
      },
      update: {
        provider: result.provider,
        wcagVersion: payload.wcagVersion,
        confidenceScore: result.enhancement.confidenceScore,
        wcagCriterion: result.enhancement.wcagCriterion,
        actualBehavior: result.enhancement.actualBehavior,
        expectedBehavior: result.enhancement.expectedBehavior,
        affectedUsers: result.enhancement.affectedUsers,
        problem: result.enhancement.problem,
        whyItMatters: result.enhancement.whyItMatters,
        howToFix: result.enhancement.howToFix,
        codeExample: result.enhancement.codeExample,
        notes: result.enhancement.notes ?? null
      },
      create: {
        workspaceId,
        userId,
        cacheKey,
        promptVersion: AI_PROMPT_VERSION,
        provider: result.provider,
        wcagVersion: payload.wcagVersion,
        confidenceScore: result.enhancement.confidenceScore,
        wcagCriterion: result.enhancement.wcagCriterion,
        actualBehavior: result.enhancement.actualBehavior,
        expectedBehavior: result.enhancement.expectedBehavior,
        affectedUsers: result.enhancement.affectedUsers,
        problem: result.enhancement.problem,
        whyItMatters: result.enhancement.whyItMatters,
        howToFix: result.enhancement.howToFix,
        codeExample: result.enhancement.codeExample,
        notes: result.enhancement.notes ?? null
      }
    });

    const enhancedCachePayload = buildEnhancedCachePayload(payload, decision.enhancement);
    const enhancedCacheKey = buildAiCacheKey(enhancedCachePayload, AI_PROMPT_VERSION);

    if (enhancedCacheKey !== cacheKey) {
      await prisma.aiEnhancementCache.upsert({
        where: {
          workspaceId_cacheKey: {
            workspaceId,
            cacheKey: enhancedCacheKey
          }
        },
        update: {
          provider: decision.usedFallback ? `${result.provider} -> Rule fallback` : result.provider,
          wcagVersion: enhancedCachePayload.wcagVersion,
          confidenceScore: decision.enhancement.confidenceScore,
          wcagCriterion: decision.enhancement.wcagCriterion,
          actualBehavior: decision.enhancement.actualBehavior,
          expectedBehavior: decision.enhancement.expectedBehavior,
          affectedUsers: decision.enhancement.affectedUsers,
          problem: decision.enhancement.problem,
          whyItMatters: decision.enhancement.whyItMatters,
          howToFix: decision.enhancement.howToFix,
          codeExample: decision.enhancement.codeExample,
          notes: decision.enhancement.notes ?? null
        },
        create: {
          workspaceId,
          userId,
          cacheKey: enhancedCacheKey,
          promptVersion: AI_PROMPT_VERSION,
          provider: decision.usedFallback ? `${result.provider} -> Rule fallback` : result.provider,
          wcagVersion: enhancedCachePayload.wcagVersion,
          confidenceScore: decision.enhancement.confidenceScore,
          wcagCriterion: decision.enhancement.wcagCriterion,
          actualBehavior: decision.enhancement.actualBehavior,
          expectedBehavior: decision.enhancement.expectedBehavior,
          affectedUsers: decision.enhancement.affectedUsers,
          problem: decision.enhancement.problem,
          whyItMatters: decision.enhancement.whyItMatters,
          howToFix: decision.enhancement.howToFix,
          codeExample: decision.enhancement.codeExample,
          notes: decision.enhancement.notes ?? null
        }
      });
    }

    return {
      provider: decision.usedFallback ? `${result.provider} -> Rule fallback` : result.provider,
      usedFallback: decision.usedFallback,
      fallbackReason: decision.reason,
      qualityScore: decision.quality.score,
      strategy: decision.strategy,
      enhancement: {
        ...decision.enhancement,
        cached: false
      }
    };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : messages.aiUnavailable
    };
  }
}

export async function createStripeCheckoutAction(): Promise<ActionState> {
  const { userId, workspaceId, email, locale } = await requireWorkspace();
  const messages = getActionMessages(locale);
  const stripe = getStripeClient();
  const priceId = process.env.STRIPE_PRO_PRICE_ID;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!stripe || !priceId || !appUrl) {
    return {
      error: messages.stripeMissing
    };
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: email || undefined,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/dashboard/billing?checkout=success`,
    cancel_url: `${appUrl}/dashboard/billing?checkout=cancelled`,
    subscription_data: {
      metadata: {
        userId,
        workspaceId,
        plan: "PRO"
      }
    },
    metadata: {
      userId,
      workspaceId,
      plan: "PRO"
    }
  });

  await logWorkspaceAuditEvent({
    workspaceId,
    actorUserId: userId,
    eventType: "BILLING_CHECKOUT_CREATED",
    entityType: "subscription",
    entityId: session.id,
    message: "Stripe checkout session created for Pro upgrade.",
    metadata: { mode: "subscription", plan: "PRO" }
  });

  return {
    success: messages.stripeCheckoutCreated,
    url: session.url ?? undefined
  };
}

export async function createStripePortalAction(): Promise<ActionState> {
  const { userId, workspaceId, locale } = await requireWorkspace();
  const messages = getActionMessages(locale);
  const stripe = getStripeClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!stripe || !appUrl) {
    return {
      error: messages.stripeMissing
    };
  }

  const subscription = await prisma.subscription.findFirst({
    where: {
      userId,
      workspaceId
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  if (!subscription?.stripeCustomerId) {
    return {
      error: messages.stripePortalUnavailable
    };
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: subscription.stripeCustomerId,
    return_url: `${appUrl}/dashboard/billing`
  });

  await logWorkspaceAuditEvent({
    workspaceId,
    actorUserId: userId,
    eventType: "BILLING_PORTAL_OPENED",
    entityType: "subscription",
    entityId: subscription.id,
    message: "Customer portal session opened.",
    metadata: { stripeCustomerId: subscription.stripeCustomerId }
  });

  return {
    success: messages.stripePortalCreated,
    url: session.url
  };
}

export async function saveGeneratedBug(values: GeneratorFormValues): Promise<ActionState> {
  const { userId, workspaceId, locale } = await requireWorkspace();
  const messages = getActionMessages(locale);
  const payload = generatorSchema.parse(values);
  const { planKey, plan, monthlyCount } = await getPlanInfo(workspaceId, userId);

  const existingBug = payload.bugId
    ? await prisma.generatedBug.findFirst({
        where: {
          id: payload.bugId,
          workspaceId,
          userId
        }
      })
    : null;

  if (!existingBug && plan.generationLimit !== null && monthlyCount >= plan.generationLimit) {
    return {
      error: messages.freePlanLimit
    };
  }

  const content = formatBugReport(payload);

  const data = {
    projectId: payload.projectId || null,
    title: `${payload.screenName}: ${payload.component}`,
    issueType: payload.issueType,
    severity: payload.severity,
    wcagVersion: payload.wcagVersion,
    component: payload.component,
    screenName: payload.screenName,
    affectedUsers: payload.affectedUsers,
    actualBehavior: payload.actualBehavior,
    expectedBehavior: payload.expectedBehavior,
    wcagCriterion: payload.wcagCriterion,
    toolsUsed: payload.toolsUsed,
    reproductionSteps: payload.reproductionSteps ?? null,
    browserInfo: payload.browserInfo ?? null,
    operatingSystem: payload.operatingSystem ?? null,
    deviceInfo: payload.deviceInfo ?? null,
    assistiveTechnology: payload.assistiveTechnology ?? null,
    videoUrl: payload.videoUrl ?? null,
    screenshotUrls: payload.screenshotUrls ?? null,
    notes: payload.notes,
    markdownContent: content
  };

  const bug = existingBug
    ? await prisma.generatedBug.update({
        where: { id: existingBug.id },
        data
      })
    : await prisma.generatedBug.create({
        data: {
          workspaceId,
          userId,
          ...data
        }
      });

  await logWorkspaceAuditEvent({
    workspaceId,
    actorUserId: userId,
    eventType: existingBug ? "BUG_UPDATED" : "BUG_SAVED",
    entityType: "generated_bug",
    entityId: bug.id,
    message: existingBug ? "Bug report updated." : "Bug report created.",
    metadata: {
      severity: bug.severity,
      issueType: bug.issueType,
      wcagVersion: bug.wcagVersion
    }
  });

  revalidatePath("/dashboard/history");
  revalidatePath("/dashboard/billing");
  revalidatePath("/dashboard/generator");
  revalidatePath("/dashboard/analytics");

  return {
    success: existingBug
      ? messages.bugUpdated
      : planKey === "pro"
        ? messages.bugSavedPro
        : messages.bugSavedFree,
    id: bug.id
  };
}

export async function saveReusableBugAction(values: GeneratorFormValues): Promise<ActionState> {
  const { userId, workspaceId, locale } = await requireWorkspace();
  const messages = getActionMessages(locale);
  const payload = generatorSchema.parse(values);
  const title = `${payload.component}: ${payload.screenName}`;
  const tags = Array.from(
    new Set(
      [payload.component, payload.severity, payload.issueType]
        .map((value) => value.trim())
        .filter(Boolean)
    )
  );

  const savedReusableBug = await prisma.reusableBug.create({
    data: {
      workspaceId,
      userId,
      title,
      category: payload.issueType,
      tags,
      issueType: payload.issueType,
      severity: payload.severity,
      wcagVersion: payload.wcagVersion,
      component: payload.component,
      screenName: payload.screenName,
      affectedUsers: payload.affectedUsers,
      actualBehavior: payload.actualBehavior,
      expectedBehavior: payload.expectedBehavior,
      wcagCriterion: payload.wcagCriterion,
      toolsUsed: payload.toolsUsed,
      reproductionSteps: payload.reproductionSteps ?? null,
      browserInfo: payload.browserInfo ?? null,
      operatingSystem: payload.operatingSystem ?? null,
      deviceInfo: payload.deviceInfo ?? null,
      assistiveTechnology: payload.assistiveTechnology ?? null,
      videoUrl: payload.videoUrl ?? null,
      screenshotUrls: payload.screenshotUrls ?? null,
      notes: payload.notes
    }
  });

  await logWorkspaceAuditEvent({
    workspaceId,
    actorUserId: userId,
    eventType: "LIBRARY_ITEM_SAVED",
    entityType: "reusable_bug",
    entityId: savedReusableBug.id,
    message: "Reusable library bug saved.",
    metadata: {
      severity: savedReusableBug.severity,
      category: savedReusableBug.category
    }
  });

  revalidatePath("/dashboard/library");
  revalidatePath("/dashboard/generator");
  revalidatePath("/dashboard/analytics");

  return { success: messages.librarySaved };
}

export async function deleteReusableBugAction(itemId: string): Promise<ActionState> {
  const { userId, workspaceId, locale, role } = await requireWorkspace();
  const messages = getActionMessages(locale);
  const item = await prisma.reusableBug.findFirst({
    where: { id: itemId, workspaceId }
  });

  if (!item) {
    return { error: messages.libraryNotFound };
  }

  await prisma.reusableBug.delete({ where: { id: item.id } });

  await logWorkspaceAuditEvent({
    workspaceId,
    actorUserId: userId,
    eventType: "LIBRARY_ITEM_DELETED",
    entityType: "reusable_bug",
    entityId: item.id,
    message: "Reusable library bug deleted.",
    metadata: { severity: item.severity, category: item.category }
  });

  revalidatePath("/dashboard/library");
  revalidatePath("/dashboard/generator");
  revalidatePath("/dashboard/analytics");

  return { success: messages.libraryDeleted };
}

export async function createProjectAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { userId, workspaceId, locale, role } = await requireWorkspace();
  const messages = getActionMessages(locale);
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (name.length < 2) {
    return { error: messages.projectNameRequired };
  }

  await prisma.project.create({
    data: {
      workspaceId,
      name,
      description: description || null
    }
  });

  revalidatePath("/dashboard/projects");
  revalidatePath("/dashboard/generator");

  return { success: messages.projectCreated };
}

export async function createTemplateAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { userId, workspaceId, locale, role } = await requireWorkspace();
  const messages = getActionMessages(locale);
  const templateId = String(formData.get("templateId") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const category = String(formData.get("category") ?? "forms").trim();
  const severity = String(formData.get("severity") ?? "Medium").trim();
  const wcagVersion = String(formData.get("wcagVersion") ?? "2.2").trim();
  const description = String(formData.get("description") ?? "").trim();
  const actualBehavior = String(formData.get("actualBehavior") ?? "").trim();
  const expectedBehavior = String(formData.get("expectedBehavior") ?? "").trim();
  const wcagCriterion = String(formData.get("wcagCriterion") ?? "").trim();
  const toolsUsed = String(formData.get("toolsUsed") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const component = String(formData.get("component") ?? "").trim();
  const screenName = String(formData.get("screenName") ?? "").trim();
  const affectedUsers = String(formData.get("affectedUsers") ?? "").trim();

  if (!title || !description || !actualBehavior || !expectedBehavior) {
    return { error: messages.templateMainFieldsRequired };
  }

  const baseSlug = slugify(title);
  const data = {
    title,
    category,
    description,
    issueType: "Accessibility",
    severity,
    wcagVersion,
    component: component || null,
    screenName: screenName || null,
    affectedUsers: affectedUsers || null,
    actualBehavior,
    expectedBehavior,
    wcagCriterion,
    toolsUsed,
    notes: notes || null,
    isSystem: false
  };

  try {
    if (templateId) {
      const existingTemplate = await prisma.bugTemplate.findFirst({
        where: { id: templateId, workspaceId, isSystem: false }
      });

      if (!existingTemplate) {
        return { error: messages.templateNotFound };
      }

      await prisma.bugTemplate.update({
        where: { id: existingTemplate.id },
        data
      });
    } else {
      await prisma.bugTemplate.create({
        data: {
          workspaceId,
          slug: `${baseSlug}-${Date.now()}`,
          ...data
        }
      });
    }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return { error: messages.templateSaveConflict };
    }

    return { error: messages.templateSaveFailed };
  }

  revalidatePath("/dashboard/templates");
  revalidatePath("/dashboard/generator");

  return { success: templateId ? messages.templateUpdated : messages.templateSaved };
}

export async function deleteTemplateAction(templateId: string): Promise<ActionState> {
  const { userId, workspaceId, locale, role } = await requireWorkspace();
  const messages = getActionMessages(locale);

  const template = await prisma.bugTemplate.findFirst({
    where: { id: templateId, workspaceId, isSystem: false }
  });

  if (!template) {
    return { error: messages.templateNotFound };
  }

  await prisma.bugTemplate.delete({ where: { id: template.id } });

  revalidatePath("/dashboard/templates");
  revalidatePath("/dashboard/generator");

  return { success: messages.templateDeleted };
}


export async function upsertComponentIssueSuggestionAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { userId, workspaceId, locale, role } = await requireWorkspace();
  const messages = getActionMessages(locale);
  const suggestionId = String(formData.get("suggestionId") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const componentKey = String(formData.get("componentKey") ?? "").trim().toLowerCase();
  const severity = String(formData.get("severity") ?? "Medium").trim();
  const category = String(formData.get("category") ?? "general").trim().toLowerCase();
  const tags = Array.from(new Set(String(formData.get("tags") ?? "").split(",").map((tag) => tag.trim().toLowerCase()).filter(Boolean)));
  const affectedUsers = String(formData.get("affectedUsers") ?? "").trim();
  const actualBehavior = String(formData.get("actualBehavior") ?? "").trim();
  const expectedBehavior = String(formData.get("expectedBehavior") ?? "").trim();
  const wcagCriterion = String(formData.get("wcagCriterion") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!title || !componentKey || !category || !actualBehavior || !expectedBehavior || !wcagCriterion) {
    return { error: messages.componentSuggestionMainFieldsRequired };
  }

  const data = {
    title,
    componentKey,
    severity,
    category,
    tags,
    affectedUsers: affectedUsers || "Screen reader users; Keyboard-only users",
    actualBehavior,
    expectedBehavior,
    wcagCriterion,
    notes: notes || null,
    isSystem: false
  };

  try {
    if (suggestionId) {
      const existingSuggestion = await prisma.componentIssueSuggestion.findFirst({
        where: { id: suggestionId, workspaceId, isSystem: false }
      });

      if (!existingSuggestion) {
        return { error: messages.componentSuggestionNotFound };
      }

      await prisma.componentIssueSuggestion.update({
        where: { id: existingSuggestion.id },
        data
      });
    } else {
      const baseSlug = `${componentKey}-${slugify(title)}`;

      await prisma.componentIssueSuggestion.create({
        data: {
          workspaceId,
          slug: `${baseSlug}-${Date.now()}`,
          ...data
        }
      });
    }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return { error: messages.componentSuggestionSaveConflict };
    }

    return { error: messages.componentSuggestionSaveFailed };
  }

  revalidatePath("/dashboard/templates");
  revalidatePath("/dashboard/generator");

  return { success: suggestionId ? messages.componentSuggestionUpdated : messages.componentSuggestionSaved };
}

export async function deleteComponentIssueSuggestionAction(suggestionId: string): Promise<ActionState> {
  const { userId, workspaceId, locale, role } = await requireWorkspace();
  const messages = getActionMessages(locale);

  const suggestion = await prisma.componentIssueSuggestion.findFirst({
    where: { id: suggestionId, workspaceId, isSystem: false }
  });

  if (!suggestion) {
    return { error: messages.componentSuggestionNotFound };
  }

  await prisma.componentIssueSuggestion.delete({ where: { id: suggestion.id } });

  revalidatePath("/dashboard/templates");
  revalidatePath("/dashboard/generator");

  return { success: messages.componentSuggestionDeleted };
}

export async function updateHistoryBugInlineAction(input: {
  id: string;
  projectId?: string | null;
  severity: string;
  component: string;
  screenName: string;
  wcagVersion: string;
  wcagCriterion: string;
  notes?: string | null;
}): Promise<ActionState> {
  const { userId, workspaceId, locale, role } = await requireWorkspace();
  const messages = getActionMessages(locale);

  const bug = await prisma.generatedBug.findFirst({
    where: { id: input.id, workspaceId }
  });

  if (!bug) {
    return { error: messages.historyBugNotFound };
  }

  const nextProjectId = input.projectId?.trim() ? input.projectId.trim() : null;

  if (nextProjectId) {
    const project = await prisma.project.findFirst({
      where: { id: nextProjectId, workspaceId },
      select: { id: true }
    });

    if (!project) {
      return { error: messages.projectNameRequired };
    }
  }

  let nextValues: GeneratorFormValues;

  try {
    nextValues = generatorSchema.parse({
      bugId: bug.id,
      projectId: nextProjectId || "",
      issueType: bug.issueType,
      severity: input.severity,
      component: input.component.trim(),
      screenName: input.screenName.trim(),
      affectedUsers: bug.affectedUsers,
      actualBehavior: bug.actualBehavior,
      expectedBehavior: bug.expectedBehavior,
      wcagVersion: input.wcagVersion,
      wcagCriterion: input.wcagCriterion.trim(),
      toolsUsed: bug.toolsUsed,
      reproductionSteps: bug.reproductionSteps ?? "",
      browserInfo: bug.browserInfo ?? "",
      operatingSystem: bug.operatingSystem ?? "",
      deviceInfo: bug.deviceInfo ?? "",
      assistiveTechnology: bug.assistiveTechnology ?? "",
      videoUrl: bug.videoUrl ?? "",
      screenshotUrls: bug.screenshotUrls ?? "",
      notes: input.notes?.trim() || ""
    });
  } catch {
    return { error: messages.templateMainFieldsRequired };
  }

  const markdownContent = formatBugReport(nextValues);

  await prisma.generatedBug.update({
    where: { id: bug.id },
    data: {
      projectId: nextProjectId,
      title: `${nextValues.screenName}: ${nextValues.component}`,
      severity: nextValues.severity,
      component: nextValues.component,
      screenName: nextValues.screenName,
      wcagVersion: nextValues.wcagVersion,
      wcagCriterion: nextValues.wcagCriterion,
      reproductionSteps: nextValues.reproductionSteps ?? null,
      browserInfo: nextValues.browserInfo ?? null,
      operatingSystem: nextValues.operatingSystem ?? null,
      deviceInfo: nextValues.deviceInfo ?? null,
      assistiveTechnology: nextValues.assistiveTechnology ?? null,
      videoUrl: nextValues.videoUrl ?? null,
      screenshotUrls: nextValues.screenshotUrls ?? null,
      notes: nextValues.notes,
      markdownContent
    }
  });

  revalidatePath("/dashboard/history");
  revalidatePath("/dashboard/projects");
  if (nextProjectId) {
    revalidatePath(`/dashboard/projects/${nextProjectId}`);
  }

  return { success: messages.historyBugUpdated };
}

export async function duplicateHistoryBugAction(bugId: string): Promise<ActionState> {
  const { userId, workspaceId, locale } = await requireWorkspace();
  const messages = getActionMessages(locale);

  const bug = await prisma.generatedBug.findFirst({
    where: { id: bugId, workspaceId, userId }
  });

  if (!bug) {
    return { error: messages.historyBugNotFound };
  }

  const duplicate = await prisma.generatedBug.create({
    data: {
      workspaceId,
      userId,
      projectId: bug.projectId,
      title: `${bug.title} (copy)`,
      issueType: bug.issueType,
      severity: bug.severity,
      wcagVersion: bug.wcagVersion,
      component: bug.component,
      screenName: bug.screenName,
      affectedUsers: bug.affectedUsers,
      actualBehavior: bug.actualBehavior,
      expectedBehavior: bug.expectedBehavior,
      wcagCriterion: bug.wcagCriterion,
      toolsUsed: bug.toolsUsed,
      reproductionSteps: bug.reproductionSteps,
      browserInfo: bug.browserInfo,
      operatingSystem: bug.operatingSystem,
      deviceInfo: bug.deviceInfo,
      assistiveTechnology: bug.assistiveTechnology,
      videoUrl: bug.videoUrl,
      screenshotUrls: bug.screenshotUrls,
      notes: bug.notes,
      markdownContent: bug.markdownContent
    }
  });

  revalidatePath("/dashboard/history");
  if (bug.projectId) {
    revalidatePath(`/dashboard/projects/${bug.projectId}`);
  }
  revalidatePath("/dashboard/analytics");

  return { success: messages.historyBugDuplicated, id: duplicate.id };
}
export async function updateSettingsAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { userId, workspaceId, locale, role } = await requireWorkspace();
  const messages = getActionMessages(locale);
  const workspaceName = String(formData.get("workspaceName") ?? "").trim();
  const defaultTools = String(formData.get("defaultTools") ?? "").trim();
  const uiLocale = String(formData.get("uiLocale") ?? "en").trim().toLowerCase();
  const jiraBaseUrl = String(formData.get("jiraBaseUrl") ?? "").trim();
  const jiraProjectKey = String(formData.get("jiraProjectKey") ?? "").trim().toUpperCase();
  const jiraIssueType = String(formData.get("jiraIssueType") ?? "").trim() || "Bug";
  const azureBaseUrl = String(formData.get("azureBaseUrl") ?? "").trim();
  const azureWorkItemType = String(formData.get("azureWorkItemType") ?? "").trim() || "Bug";
  const linearTeamId = String(formData.get("linearTeamId") ?? "").trim();

  if (!hasRole(role, "ADMIN")) {
    return { error: messages.forbidden };
  }

  if (workspaceName.length < 2) {
    return { error: messages.workspaceNameRequired };
  }

  if (uiLocale !== "en" && uiLocale !== "uk") {
    return { error: messages.unsupportedLanguage };
  }

  await prisma.workspace.update({
    where: { id: workspaceId },
    data: {
      name: workspaceName,
      defaultTools: defaultTools || null,
      uiLocale,
      jiraBaseUrl: jiraBaseUrl || null,
      jiraProjectKey: jiraProjectKey || null,
      jiraIssueType: jiraIssueType || null,
      azureBaseUrl: azureBaseUrl || null,
      azureWorkItemType: azureWorkItemType || null,
      linearTeamId: linearTeamId || null
    }
  });

  const cookieStore = await cookies();
  cookieStore.set("ui-locale", uiLocale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax"
  });

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard/generator");

  return { success: messages.settingsUpdated };
}

export async function inviteWorkspaceMemberAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { userId, workspaceId, locale, role } = await requireWorkspace();
  const messages = getActionMessages(locale);

  if (!hasRole(role, "ADMIN")) {
    return { error: messages.forbidden };
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const requestedRole = normalizeWorkspaceRole(String(formData.get("role") ?? "MEMBER"));

  if (!email || !email.includes("@")) {
    return { error: messages.inviteEmailRequired };
  }

  if (requestedRole === "OWNER") {
    return { error: messages.inviteRoleUnsupported };
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true }
  });

  if (existingUser) {
    const existingMembership = await prisma.workspaceMember.findFirst({
      where: {
        userId: existingUser.id,
        workspaceId
      },
      select: { id: true }
    });

    if (existingMembership) {
      return { error: messages.inviteAlreadyMember };
    }
  }

  const token = buildInviteToken();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);

  const createdInvite = await prisma.workspaceInvite.create({
    data: {
      workspaceId,
      email,
      role: requestedRole,
      token,
      invitedByUserId: userId,
      expiresAt
    }
  });

  await logWorkspaceAuditEvent({
    workspaceId,
    actorUserId: userId,
    eventType: "MEMBER_INVITED",
    entityType: "workspace_invite",
    entityId: createdInvite.id,
    message: `Workspace invite sent to ${email}.`,
    metadata: { email, role: requestedRole }
  });

  revalidatePath("/dashboard/settings");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  const invitePath = `/accept-invite?token=${token}`;

  return {
    success: messages.inviteCreated,
    inviteLink: appUrl ? `${appUrl}${invitePath}` : invitePath
  };
}

export async function revokeWorkspaceInviteAction(inviteId: string): Promise<ActionState> {
  const { userId, workspaceId, locale, role } = await requireWorkspace();
  const messages = getActionMessages(locale);

  if (!hasRole(role, "ADMIN")) {
    return { error: messages.forbidden };
  }

  const invite = await prisma.workspaceInvite.findFirst({
    where: {
      id: inviteId,
      workspaceId,
      acceptedAt: null
    },
    select: { id: true, email: true, role: true }
  });

  if (!invite) {
    return { error: messages.inviteNotFound };
  }

  await prisma.workspaceInvite.delete({
    where: { id: invite.id }
  });

  await logWorkspaceAuditEvent({
    workspaceId,
    actorUserId: userId,
    eventType: "INVITE_REVOKED",
    entityType: "workspace_invite",
    entityId: invite.id,
    message: `Workspace invite revoked for ${invite.email}.`,
    metadata: { email: invite.email, role: invite.role }
  });

  revalidatePath("/dashboard/settings");

  return { success: messages.inviteRevoked };
}

export async function updateWorkspaceMemberRoleAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { userId, workspaceId, locale, role } = await requireWorkspace();
  const messages = getActionMessages(locale);

  if (!hasRole(role, "ADMIN")) {
    return { error: messages.forbidden };
  }

  const memberId = String(formData.get("memberId") ?? "").trim();
  const nextRole = normalizeWorkspaceRole(String(formData.get("role") ?? "MEMBER"));

  if (!memberId) {
    return { error: messages.memberNotFound };
  }

  const member = await prisma.workspaceMember.findFirst({
    where: {
      id: memberId,
      workspaceId
    }
  });

  if (!member) {
    return { error: messages.memberNotFound };
  }

  if (member.userId === userId) {
    return { error: messages.cannotChangeOwnRole };
  }

  if (nextRole === "OWNER" && role !== "OWNER") {
    return { error: messages.forbidden };
  }

  if (member.role === "OWNER" && nextRole !== "OWNER") {
    const ownerCount = await prisma.workspaceMember.count({
      where: {
        workspaceId,
        role: "OWNER"
      }
    });

    if (ownerCount <= 1) {
      return { error: messages.cannotDemoteLastOwner };
    }
  }

  await prisma.workspaceMember.update({
    where: { id: member.id },
    data: { role: nextRole }
  });

  await logWorkspaceAuditEvent({
    workspaceId,
    actorUserId: userId,
    eventType: "MEMBER_ROLE_UPDATED",
    entityType: "workspace_member",
    entityId: member.id,
    message: `Member role changed from ${member.role} to ${nextRole}.`,
    metadata: { previousRole: member.role, nextRole }
  });

  revalidatePath("/dashboard/settings");

  return { success: messages.memberRoleUpdated };
}

export async function removeWorkspaceMemberAction(memberId: string): Promise<ActionState> {
  const { userId, workspaceId, locale, role } = await requireWorkspace();
  const messages = getActionMessages(locale);

  if (!hasRole(role, "ADMIN")) {
    return { error: messages.forbidden };
  }

  const member = await prisma.workspaceMember.findFirst({
    where: {
      id: memberId,
      workspaceId
    }
  });

  if (!member) {
    return { error: messages.memberNotFound };
  }

  if (member.userId === userId) {
    return { error: messages.cannotRemoveSelf };
  }

  if (member.role === "OWNER") {
    const ownerCount = await prisma.workspaceMember.count({
      where: {
        workspaceId,
        role: "OWNER"
      }
    });

    if (ownerCount <= 1) {
      return { error: messages.cannotRemoveLastOwner };
    }
  }

  await prisma.workspaceMember.delete({
    where: { id: member.id }
  });

  await logWorkspaceAuditEvent({
    workspaceId,
    actorUserId: userId,
    eventType: "MEMBER_REMOVED",
    entityType: "workspace_member",
    entityId: member.id,
    message: "Workspace member removed.",
    metadata: { removedUserId: member.userId, removedRole: member.role }
  });

  revalidatePath("/dashboard/settings");

  return { success: messages.memberRemoved };
}

export async function switchWorkspaceAction(workspaceId: string): Promise<ActionState> {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const access = await getWorkspaceAccessForUser(session.user.id, workspaceId);

  if (!access) {
    return { error: "Unauthorized" };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      defaultWorkspaceId: workspaceId
    }
  });

  await logWorkspaceAuditEvent({
    workspaceId,
    actorUserId: session.user.id,
    eventType: "WORKSPACE_SWITCHED",
    entityType: "workspace",
    entityId: workspaceId,
    message: "User switched active workspace."
  });

  const locale = await getWorkspaceLocale(workspaceId);
  const messages = getActionMessages(locale);

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings");

  return { success: messages.workspaceSwitched };
}

export async function saveSavedViewAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { userId, workspaceId, role } = await requireWorkspace();

  if (!hasRole(role, "MEMBER")) {
    return { error: "Forbidden" };
  }

  const scopeRaw = String(formData.get("scope") ?? "").trim().toUpperCase();
  const scope = scopeRaw === "LIBRARY" ? "LIBRARY" : scopeRaw === "HISTORY" ? "HISTORY" : null;
  const name = String(formData.get("name") ?? "").trim();
  const queryString = String(formData.get("queryString") ?? "").trim();
  const visibilityRaw = String(formData.get("visibility") ?? "").trim().toUpperCase();
  const visibility = visibilityRaw === "WORKSPACE" ? "WORKSPACE" : "PRIVATE";

  if (!scope || !name) {
    return { error: "Saved view name is required." };
  }

  const savedView = await prisma.savedView.create({
    data: {
      workspaceId,
      userId,
      scope,
      name,
      visibility,
      queryString
    }
  });

  await logWorkspaceAuditEvent({
    workspaceId,
    actorUserId: userId,
    eventType: "SAVED_VIEW_CREATED",
    entityType: "saved_view",
    entityId: savedView.id,
    message: `Saved view created: ${name}.`,
    metadata: { scope, visibility, queryString }
  });

  if (scope === "HISTORY") {
    revalidatePath("/dashboard/history");
  } else {
    revalidatePath("/dashboard/library");
  }

  return { success: visibility === "WORKSPACE" ? "Team saved view created." : "Saved view created." };
}

export async function deleteSavedViewAction(viewId: string): Promise<ActionState> {
  const { userId, workspaceId, role } = await requireWorkspace();

  if (!hasRole(role, "MEMBER")) {
    return { error: "Forbidden" };
  }

  const savedView = await prisma.savedView.findFirst({
    where: {
      id: viewId,
      workspaceId
    },
    select: {
      id: true,
      scope: true,
      visibility: true,
      userId: true
    }
  });

  if (!savedView) {
    return { error: "Saved view not found." };
  }

  const canDelete = savedView.userId === userId || hasRole(role, "ADMIN");

  if (!canDelete) {
    return { error: "Only the owner or an admin can delete this saved view." };
  }

  await prisma.savedView.delete({ where: { id: savedView.id } });

  await logWorkspaceAuditEvent({
    workspaceId,
    actorUserId: userId,
    eventType: "SAVED_VIEW_DELETED",
    entityType: "saved_view",
    entityId: savedView.id,
    message: `Saved view deleted: ${savedView.id}.`,
    metadata: { scope: savedView.scope, visibility: savedView.visibility }
  });

  if (savedView.scope === "HISTORY") {
    revalidatePath("/dashboard/history");
  } else {
    revalidatePath("/dashboard/library");
  }

  return { success: "Saved view deleted." };
}

export async function bulkDeleteHistoryBugsAction(ids: string[]): Promise<ActionState> {
  const { userId, workspaceId, role } = await requireWorkspace();

  if (!hasRole(role, "MEMBER")) {
    return { error: "Forbidden" };
  }

  const uniqueIds = Array.from(new Set(ids.map((id) => id.trim()).filter(Boolean)));

  if (uniqueIds.length === 0) {
    return { error: "Select at least one bug." };
  }

  const deletedBugs = await prisma.generatedBug.deleteMany({
    where: {
      workspaceId,
      id: { in: uniqueIds }
    }
  });

  await logWorkspaceAuditEvent({
    workspaceId,
    actorUserId: userId,
    eventType: "HISTORY_BULK_DELETED",
    entityType: "generated_bug",
    message: `Bulk delete executed for ${deletedBugs.count} history bugs.`,
    metadata: { selectedIds: uniqueIds, deletedCount: deletedBugs.count }
  });

  revalidatePath("/dashboard/history");
  revalidatePath("/dashboard/projects");
  revalidatePath("/dashboard/analytics");

  return { success: "Selected bugs deleted." };
}

export async function bulkAssignHistoryBugsProjectAction(
  ids: string[],
  projectId: string | null
): Promise<ActionState> {
  const { userId, workspaceId, role } = await requireWorkspace();

  if (!hasRole(role, "MEMBER")) {
    return { error: "Forbidden" };
  }

  const uniqueIds = Array.from(new Set(ids.map((id) => id.trim()).filter(Boolean)));

  if (uniqueIds.length === 0) {
    return { error: "Select at least one bug." };
  }

  const nextProjectId = projectId?.trim() ? projectId.trim() : null;

  if (nextProjectId) {
    const project = await prisma.project.findFirst({
      where: {
        id: nextProjectId,
        workspaceId
      },
      select: { id: true }
    });

    if (!project) {
      return { error: "Project not found." };
    }
  }

  const updatedBugs = await prisma.generatedBug.updateMany({
    where: {
      workspaceId,
      id: { in: uniqueIds }
    },
    data: {
      projectId: nextProjectId
    }
  });

  await logWorkspaceAuditEvent({
    workspaceId,
    actorUserId: userId,
    eventType: "HISTORY_BULK_ASSIGNED",
    entityType: "generated_bug",
    message: `Bulk project assignment updated ${updatedBugs.count} history bugs.`,
    metadata: { selectedIds: uniqueIds, updatedCount: updatedBugs.count, projectId: nextProjectId }
  });

  revalidatePath("/dashboard/history");
  revalidatePath("/dashboard/projects");

  return { success: "Selected bugs updated." };
}

export async function bulkDeleteLibraryItemsAction(ids: string[]): Promise<ActionState> {
  const { userId, workspaceId, role } = await requireWorkspace();

  if (!hasRole(role, "MEMBER")) {
    return { error: "Forbidden" };
  }

  const uniqueIds = Array.from(new Set(ids.map((id) => id.trim()).filter(Boolean)));

  if (uniqueIds.length === 0) {
    return { error: "Select at least one library item." };
  }

  const deletedLibraryItems = await prisma.reusableBug.deleteMany({
    where: {
      workspaceId,
      id: { in: uniqueIds }
    }
  });

  await logWorkspaceAuditEvent({
    workspaceId,
    actorUserId: userId,
    eventType: "LIBRARY_BULK_DELETED",
    entityType: "reusable_bug",
    message: `Bulk delete executed for ${deletedLibraryItems.count} library items.`,
    metadata: { selectedIds: uniqueIds, deletedCount: deletedLibraryItems.count }
  });

  revalidatePath("/dashboard/library");
  revalidatePath("/dashboard/analytics");

  return { success: "Selected library items deleted." };
}

export async function setDashboardLocaleAction(nextLocale: "en" | "uk"): Promise<ActionState> {
  if (nextLocale !== "en" && nextLocale !== "uk") {
    return { error: "Unsupported language." };
  }

  const cookieStore = await cookies();
  cookieStore.set("ui-locale", nextLocale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax"
  });

  revalidatePath("/dashboard");

  return { success: "Language updated." };
}
export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}








































