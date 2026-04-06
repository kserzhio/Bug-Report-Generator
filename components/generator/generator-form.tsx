"use client";

import { Copy, Sparkles, Trash2, Upload } from "lucide-react";
import { type ChangeEvent, useEffect, useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { FormField } from "@/components/forms/form-field";
import { useLocale } from "@/components/providers/locale-provider";
import { notifyError, notifySuccess, notifyWarning } from "@/lib/ui/toast-policy";
import { useToastMessages } from "@/src/hooks/use-toast-messages";
import { SelectField } from "@/components/forms/select-field";
import { expandShortNote } from "@/src/domain/services/generator-assist-service";
import { InsightsPanel } from "@/components/generator/insights-panel";
import { OutputPanel } from "@/components/generator/output-panel";
import { QualityScorePanel } from "@/components/generator/quality-score-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  generateInsights,
  type GeneratedInsight,
  toCsvRow,
  toPlainTextReport
} from "@/src/domain/services/bug-insights-service";
import { buildAzureCreateWorkItemUrl } from "@/src/domain/services/azure-export-service";
import { formatBugReport } from "@/src/domain/services/bug-report-service";
import { buildJiraCreateIssueUrl } from "@/src/domain/services/jira-export-service";
import { buildLinearCreateIssueUrl } from "@/src/domain/services/linear-export-service";
import {
  getWcagCriterionOptions,
  inferWcagVersion,
  WCAG_VERSION_OPTIONS,
  type WcagVersion
} from "@/src/domain/services/wcag-options";
import {
  formatVpatOutput,
  rewriteBugReport,
  type RewriteMode
} from "@/src/domain/services/rewrite-service";
import type { GeneratorFormValues } from "@/src/validation/generator";
import { generatorSchema } from "@/src/validation/generator";
import {
  enhanceBugWithAiAction,
  saveGeneratedBug,
  saveReusableBugAction
} from "@/src/server/actions/dashboard-actions";

type TemplateOption = {
  id: string;
  title: string;
  severity: string;
  actualBehavior: string;
  expectedBehavior: string;
  wcagVersion: "2.1" | "2.2";
  wcagCriterion: string;
  toolsUsed: string;
  description: string;
};


type ComponentIssueSuggestionOption = {
  id: string;
  componentKey: string;
  title: string;
  severity: GeneratorFormValues["severity"];
  affectedUsers: string;
  actualBehavior: string;
  expectedBehavior: string;
  wcagCriterion: string;
  notes: string;
};
type ProjectOption = {
  id: string;
  name: string;
};

type AssistMode = "rule" | "ai" | "hybrid";

type AiInsightState = GeneratedInsight & {
  providerLabel: string;
  cached: boolean;
};

const issueTypes = [
  "Accessibility",
  "Functional",
  "Usability",
  "Visual",
  "Regression"
].map((value) => ({ label: value, value }));

const severityLevels = ["Low", "Medium", "High", "Critical"].map((value) => ({
  label: value,
  value
}));

const rewriteModes: Array<{ label: string; value: RewriteMode }> = [
  { label: "Formal", value: "formal" },
  { label: "Simple English", value: "simple" },
  { label: "Developer-friendly", value: "developer" },
  { label: "Client-friendly", value: "client" }
];

const assistModes: Array<{ label: string; value: AssistMode }> = [
  { label: "Rule-based", value: "rule" },
  { label: "AI", value: "ai" },
  { label: "Hybrid", value: "hybrid" }
];


function downloadFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

type StoredJiraConfig = {
  baseUrl: string;
  projectKey: string;
  issueType: string;
};

type StoredAzureConfig = {
  baseUrl: string;
  workItemType: string;
};

type StoredLinearConfig = {
  teamId: string;
};

function getStoredJiraConfig(): StoredJiraConfig | null {
  if (typeof window === "undefined") {
    return null;
  }

  const baseUrl = window.localStorage.getItem("jira.baseUrl")?.trim() ?? "";
  const projectKey = window.localStorage.getItem("jira.projectKey")?.trim() ?? "";
  const issueType = window.localStorage.getItem("jira.issueType")?.trim() ?? "Bug";

  if (!baseUrl || !projectKey) {
    return null;
  }

  return {
    baseUrl,
    projectKey,
    issueType: issueType || "Bug"
  };
}

function getStoredAzureConfig(): StoredAzureConfig | null {
  if (typeof window === "undefined") {
    return null;
  }

  const baseUrl = window.localStorage.getItem("azure.baseUrl")?.trim() ?? "";
  const workItemType = window.localStorage.getItem("azure.workItemType")?.trim() ?? "Bug";

  if (!baseUrl) {
    return null;
  }

  return {
    baseUrl,
    workItemType: workItemType || "Bug"
  };
}

function getStoredLinearConfig(): StoredLinearConfig | null {
  if (typeof window === "undefined") {
    return null;
  }

  const teamId = window.localStorage.getItem("linear.teamId")?.trim() ?? "";

  if (!teamId) {
    return null;
  }

  return {
    teamId
  };
}

function mergeInsights(ruleInsight: GeneratedInsight, aiInsight: AiInsightState): GeneratedInsight {
  return {
    suggestedWcag: aiInsight.suggestedWcag || ruleInsight.suggestedWcag,
    suggestedLevel: ruleInsight.suggestedLevel,
    problem: aiInsight.problem || ruleInsight.problem,
    whyItMatters: aiInsight.whyItMatters || ruleInsight.whyItMatters,
    howToFix: Array.from(new Set([...aiInsight.howToFix, ...ruleInsight.howToFix])),
    codeExample: aiInsight.codeExample || ruleInsight.codeExample,
    matchedRuleIds: Array.from(new Set([...ruleInsight.matchedRuleIds, ...aiInsight.matchedRuleIds])),
    confidenceScore: Math.min((ruleInsight.confidenceScore + aiInsight.confidenceScore) / 2 + 0.08, 0.98)
  };
}

export function GeneratorForm({
  initialValues,
  initialTrackerSettings,
  templates,
  componentIssueSuggestions,
  projects,
  remainingGenerations,
  planName,
  canExport,
  initialAiInsight
}: {
  initialValues: GeneratorFormValues;
  initialTrackerSettings: {
    jiraBaseUrl: string;
    jiraProjectKey: string;
    jiraIssueType: string;
    azureBaseUrl: string;
    azureWorkItemType: string;
    linearTeamId: string;
  };
  initialAiInsight?: AiInsightState | null;
  templates: TemplateOption[];
  componentIssueSuggestions: ComponentIssueSuggestionOption[];
  projects: ProjectOption[];
  remainingGenerations: number | null;
  planName: string;
  canExport: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [isAiPending, startAiTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [shortNote, setShortNote] = useState("");
  const [selectedIssueIds, setSelectedIssueIds] = useState<string[]>([]);
  const [rewriteMode, setRewriteMode] = useState<RewriteMode>("formal");
  const [showVpat, setShowVpat] = useState(false);
  const [assistMode, setAssistMode] = useState<AssistMode>("hybrid");
  const [wcagVersion, setWcagVersion] = useState<WcagVersion>(initialValues.wcagVersion);
  const [aiInsight, setAiInsight] = useState<AiInsightState | null>(initialAiInsight ?? null);
  const [isEvidenceUploading, setIsEvidenceUploading] = useState(false);
  const form = useForm<GeneratorFormValues>({
    resolver: zodResolver(generatorSchema),
    defaultValues: initialValues
  });
  const t = useToastMessages();
  const locale = useLocale();
  const ui = locale === "uk" ? {
    noProject: "Без проекту",
    templatesTitle: "Готові та кастомні шаблони",
    templatesSubtitle: "Застосуйте шаблон та продовжуйте редагування.",
    plan: "план",
    outputModes: "Режими виводу",
    outputModesSubtitle: "Перемикайте тон, режим assist або VPAT формат.",
    rewriteMode: "Режим переписування",
    showBug: "Показати bug-репорт",
    vpat: "Режим VPAT",
    assistMode: "Режим assist",
    assistHint: "Rule-based швидкий, AI бере відповідь провайдера, Hybrid обєднує обидва.",
    enhancing: "Покращення...",
    runAi: "Запустити AI assist",
    assistSwitch: "Перемкніть на AI або Hybrid для WCAG та fix suggestions.",
    smartExpansion: "Smart expansion",
    smartExpansionSubtitle: "Введіть коротку нотатку і розгорніть у повний чернетковий репорт.",
    smartPlaceholder: "Приклад: tooltip працює тільки при hover",
    smartButton: "Розгорнути нотатку",
    componentIssues: "Підказки проблем за компонентом",
    componentIssuesSubtitle: "Оберіть компонент і застосуйте типові accessibility проблеми.",
    componentIssuesEmpty: "Спробуйте modal, dialog, form, table, navigation або tooltip.",
    quickComponentsLabel: "Швидкі компоненти",
    applySelectedIssues: "Застосувати вибрані",
    selectedIssues: "Вибрано",
    generator: "Генератор",
    generatorSubtitle: "Заповніть поля, превю оновлюється в реальному часі.",
    unlimited: "Безліміт генерацій",
    leftThisMonth: "залишилось цього місяця",
    issueType: "Тип проблеми",
    severity: "Серйозність",
    project: "Проект",
    component: "Компонент",
    screen: "Екран/сторінка",
    affectedUsers: "Зачеплені користувачі",
    actualBehavior: "Фактична поведінка",
    expectedBehavior: "Очікувана поведінка",
    wcagVersion: "Версія WCAG",
    wcagCriterion: "Критерій WCAG",
    toolsUsed: "Інструменти",
    reproductionSteps: "Кроки відтворення",
    browserInfo: "Браузер",
    operatingSystem: "Операційна система",
    deviceInfo: "Пристрій",
    assistiveTechnology: "Assistive technology",
    videoUrl: "Посилання на відео",
    screenshotUrls: "Посилання на скріншоти",
    notes: "Нотатки",
    optional: "Опціонально",
    saveLibrary: "Зберегти в бібліотеку",
    saving: "Збереження...",
    updateReport: "Оновити репорт",
    saveReport: "Зберегти репорт",
    qualityLabel: "якість",
    fallbackLabel: "резерв",
    uploadEvidence: "Завантажити вкладення",
    uploadInProgress: "Завантаження...",
    evidenceFiles: "Вкладення",
    copyLink: "Копіювати лінк",
    removeAttachment: "Видалити"
  } : {
    noProject: "No project",
    templatesTitle: "Prebuilt and custom templates",
    templatesSubtitle: "Apply a saved template and keep editing from there.",
    plan: "plan",
    outputModes: "Output modes",
    outputModesSubtitle: "Switch report tone, choose assist mode, or preview the issue in VPAT format.",
    rewriteMode: "Rewrite mode",
    showBug: "Show bug report",
    vpat: "VPAT mode",
    assistMode: "Assist mode",
    assistHint: "Rule-based is instant, AI uses provider output, and Hybrid blends both with cache support.",
    enhancing: "Enhancing...",
    runAi: "Run AI assist",
    assistSwitch: "Switch to AI or Hybrid when you want provider-backed WCAG and fix suggestions.",
    smartExpansion: "Smart expansion",
    smartExpansionSubtitle: "Enter a short note and expand it into a fuller structured report draft.",
    smartPlaceholder: "Example: tooltip only works on hover",
    smartButton: "Expand short note into bug draft",
    componentIssues: "Component-based issue suggestions",
    componentIssuesSubtitle: "Select a component and quickly apply common accessibility issues for it.",
    componentIssuesEmpty: "Try components like modal, dialog, form, table, navigation, or tooltip.",
    quickComponentsLabel: "Quick components",
    applySelectedIssues: "Apply selected",
    selectedIssues: "Selected",
    generator: "Generator",
    generatorSubtitle: "Fill in the structured fields and the report preview updates in real time.",
    unlimited: "Unlimited generations",
    leftThisMonth: "left this month",
    issueType: "Issue type",
    severity: "Severity",
    project: "Project",
    component: "Component",
    screen: "Screen/Page name",
    affectedUsers: "Affected users",
    actualBehavior: "Actual behavior",
    expectedBehavior: "Expected behavior",
    wcagVersion: "WCAG version",
    wcagCriterion: "WCAG criterion",
    toolsUsed: "Tools used",
    reproductionSteps: "Reproduction steps",
    browserInfo: "Browser",
    operatingSystem: "Operating system",
    deviceInfo: "Device",
    assistiveTechnology: "Assistive technology",
    videoUrl: "Video URL",
    screenshotUrls: "Screenshot URLs",
    notes: "Notes",
    optional: "Optional",
    saveLibrary: "Save to library",
    saving: "Saving...",
    updateReport: "Update report",
    saveReport: "Save report",
    qualityLabel: "quality",
    fallbackLabel: "fallback",
    uploadEvidence: "Upload evidence",
    uploadInProgress: "Uploading...",
    evidenceFiles: "Evidence files",
    copyLink: "Copy link",
    removeAttachment: "Remove"
  };

  useEffect(() => {
    if (message) {
      notifySuccess(message);
      setMessage(null);
    }
  }, [message]);

  useEffect(() => {
    if (errorMessage) {
      notifyError(errorMessage);
      setErrorMessage(null);
    }
  }, [errorMessage]);

  const values = form.watch();
  const baseContent = useMemo(() => formatBugReport(values), [values]);
  const content = useMemo(
    () => (showVpat ? formatVpatOutput(values) : rewriteBugReport(values, baseContent, rewriteMode)),
    [values, baseContent, rewriteMode, showVpat]
  );
  const ruleInsight = useMemo(() => generateInsights(values), [values]);
  const displayedInsight = useMemo(() => {
    if (assistMode === "rule") {
      return ruleInsight;
    }

    if (assistMode === "ai") {
      return aiInsight ?? ruleInsight;
    }

    return aiInsight ? mergeInsights(ruleInsight, aiInsight) : ruleInsight;
  }, [aiInsight, assistMode, ruleInsight]);
  const insightProviderLabel =
    assistMode !== "rule" && aiInsight
      ? `${aiInsight.providerLabel}${aiInsight.cached ? " (cached)" : ""}`
      : null;
  const componentIssues = useMemo(() => {
    const normalized = values.component.toLowerCase().trim();

    if (!normalized) {
      return [];
    }

    return componentIssueSuggestions.filter((item) => normalized.includes(item.componentKey.toLowerCase()));
  }, [componentIssueSuggestions, values.component]);
  const wcagOptions = useMemo(
    () => getWcagCriterionOptions(wcagVersion, values.wcagCriterion),
    [wcagVersion, values.wcagCriterion]
  );
  const screenshotEvidenceUrls = useMemo(
    () =>
      (values.screenshotUrls ?? "")
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
    [values.screenshotUrls]
  );

  function toEvidencePathname(url: string) {
    const trimmed = url.trim();

    if (!trimmed) {
      return "";
    }

    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      try {
        return new URL(trimmed).pathname;
      } catch {
        return "";
      }
    }

    return trimmed.startsWith("/") ? trimmed : "";
  }

  function isManagedEvidenceUrl(url: string) {
    return toEvidencePathname(url).startsWith("/uploads/evidence/");
  }
  useEffect(() => {
    setSelectedIssueIds((previous) => previous.filter((id) => componentIssues.some((issue) => issue.id === id)));
  }, [componentIssues]);

  function applyTemplate(templateId: string) {
    const template = templates.find((item) => item.id === templateId);

    if (!template) {
      return;
    }

    form.setValue("severity", template.severity as GeneratorFormValues["severity"]);
    form.setValue("actualBehavior", template.actualBehavior);
    form.setValue("expectedBehavior", template.expectedBehavior);
    form.setValue("wcagVersion", template.wcagVersion);
    form.setValue("wcagCriterion", template.wcagCriterion);
    setWcagVersion(template.wcagVersion);
    form.setValue("toolsUsed", template.toolsUsed);
    form.setValue("notes", template.description);
    setMessage(t.generator.templateApplied(template.title));
    setErrorMessage(null);
    setAiInsight(null);
  }

  function applyComponentIssue(issueId: string) {
    const issue = componentIssues.find((item) => item.id === issueId);

    if (!issue) {
      return;
    }

    form.setValue("severity", issue.severity);
    form.setValue("affectedUsers", issue.affectedUsers);
    form.setValue("actualBehavior", issue.actualBehavior);
    form.setValue("expectedBehavior", issue.expectedBehavior);
    form.setValue("wcagCriterion", issue.wcagCriterion);
    setWcagVersion(inferWcagVersion(issue.wcagCriterion));
    form.setValue("wcagVersion", inferWcagVersion(issue.wcagCriterion));
    form.setValue("notes", issue.notes);
    setMessage(t.generator.componentIssueApplied(issue.title));
    setErrorMessage(null);
    setAiInsight(null);
  }
  function toggleComponentIssueSelection(issueId: string) {
    setSelectedIssueIds((previous) =>
      previous.includes(issueId) ? previous.filter((id) => id !== issueId) : [...previous, issueId]
    );
  }

  function applySelectedComponentIssues() {
    const selectedIssues = componentIssues.filter((issue) => selectedIssueIds.includes(issue.id));

    if (selectedIssues.length === 0) {
      setErrorMessage(locale === "uk" ? "Оберіть хоча б одну проблему компонента." : "Select at least one component issue.");
      return;
    }

    const severityRank: Record<GeneratorFormValues["severity"], number> = {
      Critical: 4,
      High: 3,
      Medium: 2,
      Low: 1
    };

    const topSeverity = selectedIssues.reduce<GeneratorFormValues["severity"]>(
      (current, issue) => (severityRank[issue.severity] > severityRank[current] ? issue.severity : current),
      "Low"
    );

    const unique = (valuesList: string[]) => Array.from(new Set(valuesList.map((value) => value.trim()).filter(Boolean)));
    const firstCriterion = selectedIssues[0]?.wcagCriterion.split(";")[0]?.trim() ?? values.wcagCriterion;

    form.setValue("severity", topSeverity);
    form.setValue("affectedUsers", unique(selectedIssues.map((issue) => issue.affectedUsers)).join("; "));
    form.setValue(
      "actualBehavior",
      selectedIssues.map((issue, index) => `${index + 1}. ${issue.actualBehavior}`).join("\n")
    );
    form.setValue(
      "expectedBehavior",
      selectedIssues.map((issue, index) => `${index + 1}. ${issue.expectedBehavior}`).join("\n")
    );
    form.setValue(
      "wcagCriterion",
      unique(selectedIssues.flatMap((issue) => issue.wcagCriterion.split(";").map((value) => value.trim()))).join("; ")
    );
    form.setValue("notes", selectedIssues.map((issue) => `- ${issue.title}: ${issue.notes}`).join("\n"));

    const nextVersion = inferWcagVersion(firstCriterion);
    form.setValue("wcagVersion", nextVersion);
    setWcagVersion(nextVersion);

    setSelectedIssueIds([]);
    setErrorMessage(null);
    setAiInsight(null);
    setMessage(
      locale === "uk"
        ? `Застосовано ${selectedIssues.length} проблем(и) компонента.`
        : `Applied ${selectedIssues.length} component issue(s).`
    );
  }
  function expandNoteIntoBug() {
    const expanded = expandShortNote(shortNote, form.getValues());

    if (!expanded.actualBehavior && !expanded.expectedBehavior) {
      setErrorMessage(t.generator.shortNoteRequired);
      return;
    }

    Object.entries(expanded).forEach(([key, value]) => {
      if (typeof value === "string") {
        form.setValue(key as keyof GeneratorFormValues, value as never);
      }
    });

    setMessage(t.generator.shortNoteExpanded);
    setErrorMessage(null);
    setAiInsight(null);
  }

  function enhanceWithAi() {
    startAiTransition(async () => {
      setMessage(null);
      setErrorMessage(null);

      const isValid = await form.trigger();

      if (!isValid) {
        return;
      }

      const result = await enhanceBugWithAiAction(form.getValues());

      if (result.error || !result.enhancement) {
        setErrorMessage(result.error ?? t.generator.aiUnavailable);
        return;
      }

      const nextVersion = inferWcagVersion(result.enhancement.wcagCriterion);
      form.setValue("wcagVersion", nextVersion);
      form.setValue("wcagCriterion", result.enhancement.wcagCriterion);
      setWcagVersion(nextVersion);
      form.setValue("actualBehavior", result.enhancement.actualBehavior);
      form.setValue("expectedBehavior", result.enhancement.expectedBehavior);
      form.setValue("affectedUsers", result.enhancement.affectedUsers);
      if (result.enhancement.notes) {
        form.setValue("notes", result.enhancement.notes);
      }

      const provider = result.provider ?? t.generator.enhanceProviderFallback;
      const qualityPart = result.qualityScore ? ` | ${ui.qualityLabel} ${Math.round(result.qualityScore * 100)}%` : "";
      const fallbackPart = result.usedFallback ? ` | ${ui.fallbackLabel}` : "";

      setAiInsight({
        suggestedWcag: result.enhancement.wcagCriterion,
        suggestedLevel: ruleInsight.suggestedLevel,
        problem: result.enhancement.problem,
        whyItMatters: result.enhancement.whyItMatters,
        howToFix: result.enhancement.howToFix,
        codeExample: result.enhancement.codeExample,
        matchedRuleIds: ruleInsight.matchedRuleIds,
        confidenceScore: result.enhancement.confidenceScore,
        providerLabel: `${provider}${qualityPart}${fallbackPart}`,
        cached: result.enhancement.cached
      });

      if (result.usedFallback) {
        notifyWarning(t.generator.aiFallbackUsed(provider, result.fallbackReason));
      }

      setMessage(
        result.enhancement.cached
          ? t.generator.aiLoadedFromCache(provider)
          : result.usedFallback
            ? t.generator.aiFallbackUsed(provider, result.fallbackReason)
            : t.generator.aiEnhanced(provider)
      );
    });
  }

  function handleWcagVersionChange(nextVersion: WcagVersion) {
    form.setValue("wcagVersion", nextVersion);
    setWcagVersion(nextVersion);

    const nextOptions = getWcagCriterionOptions(nextVersion);
    const currentCriterion = form.getValues("wcagCriterion");
    const currentCode = currentCriterion.match(/^\d+\.\d+\.\d+/)?.[0];
    const hasMatchingOption = nextOptions.some((option) => option.value === currentCriterion || option.value.startsWith(`${currentCode ?? ""} `));

    if (!hasMatchingOption && nextOptions[0]) {
      form.setValue("wcagCriterion", nextOptions[0].value);
    }
  }

  function ensureExportAccess() {
    if (!canExport) {
      notifyWarning(t.generator.exportRequiresPro);
      return false;
    }

    return true;
  }


  async function handleEvidenceFilesSelected(event: ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files ?? []);

    if (selectedFiles.length === 0) {
      return;
    }

    setIsEvidenceUploading(true);

    try {
      const formData = new FormData();

      for (const file of selectedFiles) {
        formData.append("files", file);
      }

      const response = await fetch("/api/evidence-upload", {
        method: "POST",
        body: formData
      });

      const payload = (await response.json().catch(() => null)) as { urls?: string[]; error?: string } | null;

      if (!response.ok || !payload?.urls) {
        throw new Error(payload?.error ?? (locale === "uk" ? "Не вдалося завантажити файли." : "Could not upload files."));
      }

      const existingUrls = (form.getValues("screenshotUrls") ?? "")
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

      const merged = Array.from(new Set([...existingUrls, ...payload.urls]));
      form.setValue("screenshotUrls", merged.join("\n"), {
        shouldDirty: true,
        shouldTouch: true
      });

      setMessage(
        locale === "uk"
          ? `Завантажено файлів: ${payload.urls.length}.`
          : `Uploaded ${payload.urls.length} file(s).`
      );
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : locale === "uk"
            ? "Не вдалося завантажити файли."
            : "Could not upload files."
      );
    } finally {
      setIsEvidenceUploading(false);
      event.target.value = "";
    }
  }

  async function removeEvidence(url: string, field: "video" | "screenshots") {
    const currentVideoUrl = form.getValues("videoUrl")?.trim() ?? "";
    const currentScreenshotUrls = (form.getValues("screenshotUrls") ?? "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    if (isManagedEvidenceUrl(url)) {
      const response = await fetch("/api/evidence-upload", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ url })
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? (locale === "uk" ? "Не вдалося видалити вкладення." : "Could not remove attachment."));
      }
    }

    if (field === "video") {
      form.setValue("videoUrl", "", { shouldDirty: true, shouldTouch: true });
      return;
    }

    const targetPath = toEvidencePathname(url);
    const nextScreenshotUrls = currentScreenshotUrls.filter((item) => {
      if (item === url) {
        return false;
      }

      if (!targetPath) {
        return true;
      }

      return toEvidencePathname(item) !== targetPath;
    });

    form.setValue("screenshotUrls", nextScreenshotUrls.join("\n"), {
      shouldDirty: true,
      shouldTouch: true
    });
  }

  async function handleRemoveEvidence(url: string, field: "video" | "screenshots") {
    try {
      await removeEvidence(url, field);
      setMessage(locale === "uk" ? "Вкладення видалено." : "Attachment removed.");
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : locale === "uk"
            ? "Не вдалося видалити вкладення."
            : "Could not remove attachment."
      );
    }
  }

  function handleCopyEvidenceUrl(url: string) {
    void navigator.clipboard.writeText(url);
    setMessage(locale === "uk" ? "Лінк скопійовано." : "Link copied.");
    setErrorMessage(null);
  }

  function exportMarkdown() {
    if (!ensureExportAccess()) {
      return;
    }

    downloadFile("bug-report.md", content, "text/markdown;charset=utf-8");
  }

  function exportPlainText() {
    if (!ensureExportAccess()) {
      return;
    }

    downloadFile("bug-report.txt", toPlainTextReport(values), "text/plain;charset=utf-8");
  }

  function exportJson() {
    if (!ensureExportAccess()) {
      return;
    }

    downloadFile(
      "bug-report.json",
      JSON.stringify({ ...values, rewriteMode, showVpat, assistMode, insight: displayedInsight, componentIssues }, null, 2),
      "application/json;charset=utf-8"
    );
  }

  function exportCsv() {
    if (!ensureExportAccess()) {
      return;
    }

    downloadFile("bug-report.csv", toCsvRow(values), "text/csv;charset=utf-8");
  }

  function exportJira() {
    if (!ensureExportAccess()) {
      return;
    }

    const stored = getStoredJiraConfig();
    const defaults = {
      baseUrl: initialTrackerSettings.jiraBaseUrl || stored?.baseUrl || "",
      projectKey: initialTrackerSettings.jiraProjectKey || stored?.projectKey || "",
      issueType: initialTrackerSettings.jiraIssueType || stored?.issueType || "Bug"
    };
    const baseUrl = window.prompt(
      locale === "uk"
        ? "Jira base URL (наприклад, https://your-team.atlassian.net)"
        : "Jira base URL (for example, https://your-team.atlassian.net)",
      defaults.baseUrl
    )?.trim();

    if (!baseUrl) {
      return;
    }

    const projectKey = window.prompt(
      locale === "uk" ? "Jira project key (наприклад, WEB)" : "Jira project key (for example, WEB)",
      defaults.projectKey
    )?.trim();

    if (!projectKey) {
      return;
    }

    const issueType = window.prompt(
      locale === "uk" ? "Issue type (за замовчуванням Bug)" : "Issue type (default Bug)",
      defaults.issueType
    )?.trim() || "Bug";

    const summary = `[${values.severity}] ${values.screenName}: ${values.component}`;
    const url = buildJiraCreateIssueUrl(
      {
        baseUrl,
        projectKey,
        issueType
      },
      summary,
      toPlainTextReport(values)
    );

    if (!url) {
      notifyError(locale === "uk" ? "Невалідні налаштування Jira export." : "Invalid Jira export settings.");
      return;
    }

    window.localStorage.setItem("jira.baseUrl", baseUrl);
    window.localStorage.setItem("jira.projectKey", projectKey);
    window.localStorage.setItem("jira.issueType", issueType);
    window.open(url, "_blank", "noopener,noreferrer");
    notifySuccess(locale === "uk" ? "Відкрито створення issue в Jira." : "Opened Jira issue creation.");
  }

  function exportAzure() {
    if (!ensureExportAccess()) {
      return;
    }

    const stored = getStoredAzureConfig();
    const defaults = {
      baseUrl: initialTrackerSettings.azureBaseUrl || stored?.baseUrl || "",
      workItemType: initialTrackerSettings.azureWorkItemType || stored?.workItemType || "Bug"
    };
    const baseUrl = window.prompt(
      locale === "uk"
        ? "Azure DevOps project URL (наприклад, https://dev.azure.com/org/project)"
        : "Azure DevOps project URL (for example, https://dev.azure.com/org/project)",
      defaults.baseUrl
    )?.trim();

    if (!baseUrl) {
      return;
    }

    const workItemType = window.prompt(
      locale === "uk" ? "Work item type (за замовчуванням Bug)" : "Work item type (default Bug)",
      defaults.workItemType
    )?.trim() || "Bug";

    const title = `[${values.severity}] ${values.screenName}: ${values.component}`;
    const url = buildAzureCreateWorkItemUrl(
      {
        baseUrl,
        workItemType
      },
      title,
      toPlainTextReport(values)
    );

    if (!url) {
      notifyError(locale === "uk" ? "Невалідні налаштування Azure export." : "Invalid Azure export settings.");
      return;
    }

    window.localStorage.setItem("azure.baseUrl", baseUrl);
    window.localStorage.setItem("azure.workItemType", workItemType);
    window.open(url, "_blank", "noopener,noreferrer");
    notifySuccess(locale === "uk" ? "Відкрито створення work item в Azure DevOps." : "Opened Azure DevOps work item creation.");
  }

  function exportLinear() {
    if (!ensureExportAccess()) {
      return;
    }

    const stored = getStoredLinearConfig();
    const teamId = window.prompt(
      locale === "uk" ? "Linear team key/id (наприклад, ENG)" : "Linear team key/id (for example, ENG)",
      initialTrackerSettings.linearTeamId || stored?.teamId || ""
    )?.trim();

    if (!teamId) {
      return;
    }

    const title = `[${values.severity}] ${values.screenName}: ${values.component}`;
    const url = buildLinearCreateIssueUrl(
      {
        teamId
      },
      title,
      toPlainTextReport(values)
    );

    if (!url) {
      notifyError(locale === "uk" ? "Невалідні налаштування Linear export." : "Invalid Linear export settings.");
      return;
    }

    window.localStorage.setItem("linear.teamId", teamId);
    window.open(url, "_blank", "noopener,noreferrer");
    notifySuccess(locale === "uk" ? "Відкрито створення issue в Linear." : "Opened Linear issue creation.");
  }

  function copyToClipboard() {
    void navigator.clipboard.writeText(content);
    setMessage(t.generator.copied);
    setErrorMessage(null);
  }

  function resetForm() {
    form.reset(initialValues);
    setShortNote("");
    setAiInsight(null);
    setAssistMode("hybrid");
    form.setValue("wcagVersion", initialValues.wcagVersion);
    setWcagVersion(initialValues.wcagVersion);
    setMessage(t.generator.formReset);
    setErrorMessage(null);
  }

  function applySuggestedWcag() {
    const nextVersion = inferWcagVersion(displayedInsight.suggestedWcag);
    form.setValue("wcagVersion", nextVersion);
    form.setValue("wcagCriterion", displayedInsight.suggestedWcag);
    setWcagVersion(nextVersion);
    setMessage(t.generator.wcagApplied);
    setErrorMessage(null);
  }

  function submitSave() {
    startTransition(async () => {
      setMessage(null);
      setErrorMessage(null);

      const isValid = await form.trigger();

      if (!isValid) {
        return;
      }

      const result = await saveGeneratedBug(form.getValues());

      if (result.error) {
        setErrorMessage(result.error);
        return;
      }

      if (result.id) {
        form.setValue("bugId", result.id);
      }

      setMessage(result.success ?? t.generator.reportSavedFallback);
    });
  }

  function saveToLibrary() {
    startTransition(async () => {
      setMessage(null);
      setErrorMessage(null);

      const isValid = await form.trigger();

      if (!isValid) {
        return;
      }

      const result = await saveReusableBugAction(form.getValues());

      if (result.error) {
        setErrorMessage(result.error);
        return;
      }

      setMessage(result.success ?? t.generator.librarySavedFallback);
    });
  }

  const projectOptions = [{ label: ui.noProject, value: "" }].concat(
    projects.map((project) => ({ label: project.name, value: project.id }))
  );

  const quickComponentOptions = Array.from(
    new Set(componentIssueSuggestions.map((item) => item.componentKey))
  ).map((key) => ({
    key,
    label: key
  }));

  return (
    <div className="dashboard-generator grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <div className="space-y-6 xl:pr-1">
        <Card>
          <CardHeader className="border-b border-slate-100">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle>{ui.templatesTitle}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {ui.templatesSubtitle}
                </p>
              </div>
              <Badge>{planName} {ui.plan}</Badge>
            </div>
          </CardHeader>
                    <CardContent className="flex flex-wrap gap-3 pt-6">
            {templates.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => applyTemplate(template.id)}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-left text-sm font-medium text-slate-700 transition hover:border-primary/40 hover:text-slate-950"
              >
                {template.title}
              </button>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="border-b border-slate-100">
            <CardTitle>{ui.outputModes}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {ui.outputModesSubtitle}
            </p>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
              <FormField id="rewriteMode" label={ui.rewriteMode}>
                <SelectField
                  id="rewriteMode"
                  value={rewriteMode}
                  onChange={(event) => setRewriteMode(event.target.value as RewriteMode)}
                  options={rewriteModes}
                />
              </FormField>
              <Button type="button" variant={showVpat ? "default" : "outline"} onClick={() => setShowVpat((value) => !value)}>
                {showVpat ? ui.showBug : ui.vpat}
              </Button>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-950">{ui.assistMode}</p>
              <div className="flex flex-wrap gap-2">
                {assistModes.map((mode) => (
                  <Button
                    key={mode.value}
                    type="button"
                    variant={assistMode === mode.value ? "default" : "outline"}
                    onClick={() => setAssistMode(mode.value)}
                  >
                    {mode.label}
                  </Button>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                {ui.assistHint}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button type="button" variant="outline" onClick={enhanceWithAi} disabled={isAiPending || assistMode === "rule"}>
                <Sparkles className="h-4 w-4" />
                {isAiPending ? ui.enhancing : ui.runAi}
              </Button>
              {assistMode === "rule" ? (
                <p className="text-sm text-muted-foreground">
                  {ui.assistSwitch}
                </p>
              ) : null}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="border-b border-slate-100">
            <CardTitle>{ui.smartExpansion}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {ui.smartExpansionSubtitle}
            </p>
          </CardHeader>
          <CardContent className="space-y-3 pt-6">
            <Textarea
              value={shortNote}
              onChange={(event) => setShortNote(event.target.value)}
              placeholder={ui.smartPlaceholder}
              className="min-h-24"
            />
            <Button type="button" variant="outline" onClick={expandNoteIntoBug}>
              {ui.smartButton}
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="border-b border-slate-100">
            <CardTitle>{ui.componentIssues}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {ui.componentIssuesSubtitle}
            </p>
          </CardHeader>
                    <CardContent className="flex flex-wrap gap-3 pt-6">
            <div className="w-full space-y-2">
              <p className="text-sm font-medium text-slate-900">{ui.quickComponentsLabel}</p>
              <div className="flex flex-wrap gap-2">
                {quickComponentOptions.map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => {
                      form.setValue("component", option.key);
                    }}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-primary/40 hover:text-slate-950"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
                        <div className="w-full flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-muted-foreground">{ui.selectedIssues}: {selectedIssueIds.length}</p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={selectedIssueIds.length === 0}
                onClick={applySelectedComponentIssues}
              >
                {ui.applySelectedIssues}
              </Button>
            </div>
            {componentIssues.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {ui.componentIssuesEmpty}
              </p>
            ) : null}
            {componentIssues.map((issue) => (
              <button
                key={issue.id}
                type="button"
                onClick={() => toggleComponentIssueSelection(issue.id)}
                className={`rounded-full border px-4 py-2 text-left text-sm font-medium transition ${selectedIssueIds.includes(issue.id) ? "border-primary bg-primary text-primary-foreground" : "border-slate-200 bg-white text-slate-700 hover:border-primary/40 hover:text-slate-950"}`}
              >
                {issue.title}
              </button>
            ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="border-b border-slate-100">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle>{ui.generator}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {ui.generatorSubtitle}
                </p>
              </div>
              <Badge>
                {remainingGenerations === null
                  ? ui.unlimited
                  : `${remainingGenerations} ${ui.leftThisMonth}`}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <input type="hidden" {...form.register("bugId")} />
            <input type="hidden" {...form.register("wcagVersion")} />
            <div className="grid gap-4 md:grid-cols-2">
              <FormField id="issueType" label={ui.issueType} error={form.formState.errors.issueType}>
                <SelectField id="issueType" options={issueTypes} {...form.register("issueType")} />
              </FormField>
              <FormField id="severity" label={ui.severity} error={form.formState.errors.severity}>
                <SelectField id="severity" options={severityLevels} {...form.register("severity")} />
              </FormField>
            </div>
            <FormField id="projectId" label={ui.project}>
              <SelectField id="projectId" options={projectOptions} {...form.register("projectId")} />
            </FormField>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField id="component" label={ui.component} error={form.formState.errors.component}>
                <Input id="component" {...form.register("component")} />
              </FormField>
              <FormField id="screenName" label={ui.screen} error={form.formState.errors.screenName}>
                <Input id="screenName" {...form.register("screenName")} />
              </FormField>
            </div>
            <FormField id="affectedUsers" label={ui.affectedUsers} error={form.formState.errors.affectedUsers}>
              <Input id="affectedUsers" {...form.register("affectedUsers")} />
            </FormField>
            <FormField id="actualBehavior" label={ui.actualBehavior} error={form.formState.errors.actualBehavior}>
              <Textarea id="actualBehavior" {...form.register("actualBehavior")} />
            </FormField>
            <FormField id="expectedBehavior" label={ui.expectedBehavior} error={form.formState.errors.expectedBehavior}>
              <Textarea id="expectedBehavior" {...form.register("expectedBehavior")} />
            </FormField>
            <div className="grid gap-4 md:grid-cols-3">
              <FormField id="wcagVersion" label={ui.wcagVersion}>
                <SelectField
                  id="wcagVersion"
                  value={wcagVersion}
                  onChange={(event) => handleWcagVersionChange(event.target.value as WcagVersion)}
                  options={WCAG_VERSION_OPTIONS.map((option) => ({ ...option }))}
                />
              </FormField>
              <FormField id="wcagCriterion" label={ui.wcagCriterion} error={form.formState.errors.wcagCriterion}>
                <SelectField id="wcagCriterion" options={wcagOptions} {...form.register("wcagCriterion")} />
              </FormField>
              <FormField id="toolsUsed" label={ui.toolsUsed} error={form.formState.errors.toolsUsed}>
                <Input id="toolsUsed" {...form.register("toolsUsed")} />
              </FormField>
            </div>
            <FormField id="reproductionSteps" label={ui.reproductionSteps} hint={ui.optional} error={form.formState.errors.reproductionSteps}>
              <Textarea id="reproductionSteps" placeholder="1. Open page\n2. Tab to button\n3. Press Enter" {...form.register("reproductionSteps")} />
            </FormField>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField id="browserInfo" label={ui.browserInfo} hint={ui.optional} error={form.formState.errors.browserInfo}>
                <Input id="browserInfo" placeholder="Chrome 136" {...form.register("browserInfo")} />
              </FormField>
              <FormField id="operatingSystem" label={ui.operatingSystem} hint={ui.optional} error={form.formState.errors.operatingSystem}>
                <Input id="operatingSystem" placeholder="Windows 11" {...form.register("operatingSystem")} />
              </FormField>
              <FormField id="deviceInfo" label={ui.deviceInfo} hint={ui.optional} error={form.formState.errors.deviceInfo}>
                <Input id="deviceInfo" placeholder="Desktop" {...form.register("deviceInfo")} />
              </FormField>
              <FormField id="assistiveTechnology" label={ui.assistiveTechnology} hint={ui.optional} error={form.formState.errors.assistiveTechnology}>
                <Input id="assistiveTechnology" placeholder="NVDA 2024.4" {...form.register("assistiveTechnology")} />
              </FormField>
            </div>
            <FormField id="videoUrl" label={ui.videoUrl} hint={ui.optional} error={form.formState.errors.videoUrl}>
              <Input id="videoUrl" placeholder="https://..." {...form.register("videoUrl")} />
              {values.videoUrl?.trim() ? (
                <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="mb-2 text-xs font-medium text-slate-500">{ui.evidenceFiles}</p>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <a
                      href={values.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="max-w-[70%] truncate text-sm text-slate-700 underline-offset-2 hover:underline"
                    >
                      {values.videoUrl}
                    </a>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => handleCopyEvidenceUrl(values.videoUrl ?? "")}>
                        <Copy className="h-3.5 w-3.5" />
                        {ui.copyLink}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveEvidence(values.videoUrl ?? "", "video")}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        {ui.removeAttachment}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : null}
            </FormField>
            <FormField id="screenshotUrls" label={ui.screenshotUrls} hint={ui.optional} error={form.formState.errors.screenshotUrls}>
              <Textarea id="screenshotUrls" placeholder="https://...\nhttps://..." {...form.register("screenshotUrls")} />
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <label
                  htmlFor="evidence-upload-input"
                  className={`inline-flex cursor-pointer items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition ${
                    isEvidenceUploading
                      ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                      : "border-slate-200 bg-white text-slate-700 hover:border-primary/40 hover:text-slate-950"
                  }`}
                >
                  <Upload className="h-4 w-4" />
                  {isEvidenceUploading ? ui.uploadInProgress : ui.uploadEvidence}
                </label>
                <input
                  id="evidence-upload-input"
                  type="file"
                  className="sr-only"
                  multiple
                  accept="image/*,video/mp4,video/webm,video/quicktime"
                  onChange={handleEvidenceFilesSelected}
                  disabled={isEvidenceUploading}
                />
              </div>
              {screenshotEvidenceUrls.length > 0 ? (
                <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="mb-2 text-xs font-medium text-slate-500">{ui.evidenceFiles}</p>
                  <div className="space-y-2">
                    {screenshotEvidenceUrls.map((url) => (
                      <div key={url} className="flex flex-wrap items-center justify-between gap-2">
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="max-w-[70%] truncate text-sm text-slate-700 underline-offset-2 hover:underline"
                        >
                          {url}
                        </a>
                        <div className="flex gap-2">
                          <Button type="button" variant="outline" size="sm" onClick={() => handleCopyEvidenceUrl(url)}>
                            <Copy className="h-3.5 w-3.5" />
                            {ui.copyLink}
                          </Button>
                          <Button type="button" variant="outline" size="sm" onClick={() => handleRemoveEvidence(url, "screenshots")}>
                            <Trash2 className="h-3.5 w-3.5" />
                            {ui.removeAttachment}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </FormField>
            <FormField id="notes" label={ui.notes} hint={ui.optional} error={form.formState.errors.notes}>
              <Textarea id="notes" {...form.register("notes")} />
            </FormField>
            <div className="flex flex-wrap justify-end gap-3">
              <Button type="button" variant="outline" onClick={saveToLibrary} disabled={isPending}>
                {ui.saveLibrary}
              </Button>
              <Button type="button" onClick={submitSave} disabled={isPending}>
                {isPending ? ui.saving : values.bugId ? ui.updateReport : ui.saveReport}
              </Button>
            </div>
          </CardContent>
        </Card>
        <QualityScorePanel values={values} />
        <InsightsPanel
          insight={displayedInsight}
          onApplyWcag={applySuggestedWcag}
          providerLabel={insightProviderLabel}
          mode={assistMode}
        />
      </div>
      <div className="min-w-0">
        <OutputPanel
          content={content}
          previewData={{
            component: values.component,
            severity: values.severity,
            issueType: values.issueType,
            wcag: values.wcagCriterion,
            actualBehavior: values.actualBehavior,
            expectedBehavior: values.expectedBehavior,
            affectedUsers: values.affectedUsers,
            steps: values.reproductionSteps ?? "",
            recommendations: displayedInsight.howToFix
          }}
          onCopy={copyToClipboard}
          onReset={resetForm}
          onSave={submitSave}
          onExportMarkdown={exportMarkdown}
          onExportText={exportPlainText}
          onExportJson={exportJson}
          onExportCsv={exportCsv}
          onExportJira={exportJira}
          onExportAzure={exportAzure}
          onExportLinear={exportLinear}
        />
      </div>
    </div>
  );
}

