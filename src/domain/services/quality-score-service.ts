import type { GeneratorFormValues } from "@/src/validation/generator";

export type QualityCheckId =
  | "reproduction_steps"
  | "environment_matrix"
  | "assistive_technology"
  | "evidence_assets"
  | "wcag_mapping"
  | "behavior_clarity"
  | "affected_users"
  | "tools_coverage"
  | "notes_context";

export type QualityCheckResult = {
  id: QualityCheckId;
  weight: number;
  passed: boolean;
};

export type BugReportQualityScore = {
  score: number;
  grade: "A" | "B" | "C" | "D";
  passedWeight: number;
  totalWeight: number;
  checks: QualityCheckResult[];
};

const QUALITY_WEIGHTS: Record<QualityCheckId, number> = {
  reproduction_steps: 16,
  environment_matrix: 14,
  assistive_technology: 10,
  evidence_assets: 16,
  wcag_mapping: 10,
  behavior_clarity: 12,
  affected_users: 10,
  tools_coverage: 6,
  notes_context: 6
};

function countMeaningfulSteps(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length >= 4).length;
}

function countUrls(value: string) {
  return value
    .split(/\s|\n|,/g)
    .map((part) => part.trim())
    .filter((part) => /^https?:\/\//i.test(part)).length;
}

function resolveGrade(score: number): "A" | "B" | "C" | "D" {
  if (score >= 85) return "A";
  if (score >= 70) return "B";
  if (score >= 50) return "C";
  return "D";
}

export function calculateBugReportQualityScore(values: GeneratorFormValues): BugReportQualityScore {
  const hasReproSteps = countMeaningfulSteps(values.reproductionSteps ?? "") >= 2;
  const hasEnvironment = Boolean(
    values.browserInfo?.trim() &&
      values.operatingSystem?.trim() &&
      values.deviceInfo?.trim()
  );
  const hasAssistiveTechnology = Boolean(values.assistiveTechnology?.trim());
  const hasEvidence = Boolean(values.videoUrl?.trim()) || countUrls(values.screenshotUrls ?? "") > 0;
  const hasWcag = values.wcagCriterion.trim().length >= 8;
  const hasBehaviorClarity =
    values.actualBehavior.trim().length >= 40 &&
    values.expectedBehavior.trim().length >= 40 &&
    values.actualBehavior.trim().toLowerCase() !== values.expectedBehavior.trim().toLowerCase();
  const hasAffectedUsers = values.affectedUsers.trim().length >= 12;
  const hasTools = values.toolsUsed.trim().length >= 6;
  const hasContextNotes = (values.notes ?? "").trim().length >= 20;

  const checks: QualityCheckResult[] = [
    { id: "reproduction_steps", weight: QUALITY_WEIGHTS.reproduction_steps, passed: hasReproSteps },
    { id: "environment_matrix", weight: QUALITY_WEIGHTS.environment_matrix, passed: hasEnvironment },
    { id: "assistive_technology", weight: QUALITY_WEIGHTS.assistive_technology, passed: hasAssistiveTechnology },
    { id: "evidence_assets", weight: QUALITY_WEIGHTS.evidence_assets, passed: hasEvidence },
    { id: "wcag_mapping", weight: QUALITY_WEIGHTS.wcag_mapping, passed: hasWcag },
    { id: "behavior_clarity", weight: QUALITY_WEIGHTS.behavior_clarity, passed: hasBehaviorClarity },
    { id: "affected_users", weight: QUALITY_WEIGHTS.affected_users, passed: hasAffectedUsers },
    { id: "tools_coverage", weight: QUALITY_WEIGHTS.tools_coverage, passed: hasTools },
    { id: "notes_context", weight: QUALITY_WEIGHTS.notes_context, passed: hasContextNotes }
  ];

  const totalWeight = checks.reduce((sum, check) => sum + check.weight, 0);
  const passedWeight = checks.reduce((sum, check) => sum + (check.passed ? check.weight : 0), 0);
  const score = Math.round((passedWeight / totalWeight) * 100);

  return {
    score,
    grade: resolveGrade(score),
    passedWeight,
    totalWeight,
    checks
  };
}
