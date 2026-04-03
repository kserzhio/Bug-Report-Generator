import { GeneratorForm } from "@/components/generator/generator-form";
import { prisma } from "@/lib/prisma/client";
import { generateInsights } from "@/src/domain/services/bug-insights-service";
import { buildAiCacheKey } from "@/src/server/ai/cache-key";
import { AI_PROMPT_VERSION } from "@/src/server/ai/prompt-builder";
import { getCurrentWorkspaceContext, getGeneratorInitialValues } from "@/src/server/queries/workspace";

export default async function GeneratorPage({
  searchParams
}: {
  searchParams: Promise<{ bugId?: string; duplicateId?: string; templateId?: string; projectId?: string; libraryId?: string }>;
}) {
  const params = await searchParams;
  const context = await getCurrentWorkspaceContext();
  const [baseInitialValues, templates, componentSuggestions] = await Promise.all([
    getGeneratorInitialValues(params),
    prisma.bugTemplate.findMany({
      where: {
        OR: [{ workspaceId: context.workspace.id }, { isSystem: true }]
      },
      orderBy: [{ isSystem: "desc" }, { title: "asc" }]
    }),
    prisma.componentIssueSuggestion.findMany({
      where: {
        OR: [{ workspaceId: context.workspace.id }, { isSystem: true }]
      },
      orderBy: [{ isSystem: "desc" }, { componentKey: "asc" }, { title: "asc" }]
    })
  ]);

  const initialValues =
    !params.bugId &&
    !params.duplicateId &&
    !params.templateId &&
    !params.libraryId &&
    context.workspace.defaultTools
      ? {
          ...baseInitialValues,
          toolsUsed: context.workspace.defaultTools
        }
      : baseInitialValues;

  const shouldLoadInitialAi = Boolean(params.bugId || params.duplicateId);
  let initialAiInsight: {
    suggestedWcag: string;
    suggestedLevel: "A" | "AA" | "AAA";
    problem: string;
    whyItMatters: string;
    howToFix: string[];
    codeExample: string;
    matchedRuleIds: string[];
    confidenceScore: number;
    providerLabel: string;
    cached: boolean;
  } | null = null;

  if (shouldLoadInitialAi) {
    const aiCacheKey = buildAiCacheKey(initialValues, AI_PROMPT_VERSION);
    const cachedByKey = await prisma.aiEnhancementCache.findUnique({
      where: {
        workspaceId_cacheKey: {
          workspaceId: context.workspace.id,
          cacheKey: aiCacheKey
        }
      }
    });

    const cachedAi =
      cachedByKey ??
      (await prisma.aiEnhancementCache.findFirst({
        where: {
          workspaceId: context.workspace.id,
          wcagVersion: initialValues.wcagVersion,
          wcagCriterion: initialValues.wcagCriterion,
          actualBehavior: initialValues.actualBehavior,
          expectedBehavior: initialValues.expectedBehavior,
          affectedUsers: initialValues.affectedUsers
        },
        orderBy: { updatedAt: "desc" }
      }));

    if (cachedAi) {
      const ruleInsight = generateInsights(initialValues);
      initialAiInsight = {
        suggestedWcag: cachedAi.wcagCriterion,
        suggestedLevel: ruleInsight.suggestedLevel,
        problem: cachedAi.problem,
        whyItMatters: cachedAi.whyItMatters,
        howToFix: cachedAi.howToFix,
        codeExample: cachedAi.codeExample,
        matchedRuleIds: ruleInsight.matchedRuleIds,
        confidenceScore: cachedAi.confidenceScore,
        providerLabel: cachedAi.provider,
        cached: true
      };
    }
  }

  return (
    <GeneratorForm
      initialValues={initialValues}
      initialTrackerSettings={{
        jiraBaseUrl: context.workspace.jiraBaseUrl ?? "",
        jiraProjectKey: context.workspace.jiraProjectKey ?? "",
        jiraIssueType: context.workspace.jiraIssueType ?? "Bug",
        azureBaseUrl: context.workspace.azureBaseUrl ?? "",
        azureWorkItemType: context.workspace.azureWorkItemType ?? "Bug",
        linearTeamId: context.workspace.linearTeamId ?? ""
      }}
      templates={templates.map((template) => ({
        id: template.id,
        title: template.title,
        severity: template.severity,
        wcagVersion: (template.wcagVersion as "2.1" | "2.2") ?? "2.2",
        actualBehavior: template.actualBehavior,
        expectedBehavior: template.expectedBehavior,
        wcagCriterion: template.wcagCriterion,
        toolsUsed: template.toolsUsed,
        description: template.description
      }))}
      componentIssueSuggestions={componentSuggestions.map((item) => ({
        id: item.id,
        componentKey: item.componentKey,
        title: item.title,
        severity: item.severity as "Low" | "Medium" | "High" | "Critical",
        affectedUsers: item.affectedUsers,
        actualBehavior: item.actualBehavior,
        expectedBehavior: item.expectedBehavior,
        wcagCriterion: item.wcagCriterion,
        notes: item.notes ?? ""
      }))}
      projects={context.workspace.projects.map((project) => ({
        id: project.id,
        name: project.name
      }))}
      remainingGenerations={context.remainingGenerations}
      planName={context.plan.name}
      canExport={context.plan.id === "pro"}
      initialAiInsight={initialAiInsight}
    />
  );
}
