import type { AiEnhancementPayload } from "@/lib/ai/providers";
import type { GeneratedInsight } from "@/src/domain/services/bug-insights-service";
import type { GeneratorFormValues } from "@/src/validation/generator";

type QualityCheckResult = {
  key: string;
  passed: boolean;
  score: number;
  reason: string;
};

export type AiQualityAssessment = {
  score: number;
  passed: boolean;
  checks: QualityCheckResult[];
  reasons: string[];
};

export type AiQualityDecision = {
  usedFallback: boolean;
  reason?: string;
  quality: AiQualityAssessment;
  enhancement: AiEnhancementPayload;
  strategy: "ai" | "rule-fallback";
};

const MIN_ACCEPT_SCORE = 0.62;

function tokenize(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2);
}

function overlapScore(input: string, output: string) {
  const inputTokens = new Set(tokenize(input));
  const outputTokens = tokenize(output);

  if (inputTokens.size === 0 || outputTokens.length === 0) {
    return 0;
  }

  const hits = outputTokens.filter((token) => inputTokens.has(token)).length;
  return Math.min(hits / Math.max(outputTokens.length, 1), 1);
}

function checkMinLength(key: string, value: string | undefined, min: number, label: string): QualityCheckResult {
  const normalized = (value ?? "").trim();
  const passed = normalized.length >= min;

  return {
    key,
    passed,
    score: passed ? 1 : 0,
    reason: passed
      ? `${label} looks complete.`
      : `${label} is too short for reliable automation.`
  };
}

function checkHowToFix(items: string[]): QualityCheckResult {
  const normalized = (items ?? []).map((item) => item.trim()).filter(Boolean);
  const longEnough = normalized.filter((item) => item.length >= 8);
  const passed = normalized.length >= 2 && longEnough.length >= 2;

  return {
    key: "howToFix",
    passed,
    score: passed ? 1 : 0,
    reason: passed
      ? "How-to-fix steps are actionable."
      : "How-to-fix needs at least two concrete steps."
  };
}

function checkNoLowQualityPhrases(payload: AiEnhancementPayload): QualityCheckResult {
  const text = [
    payload.problem,
    payload.whyItMatters,
    payload.actualBehavior,
    payload.expectedBehavior,
    payload.notes ?? ""
  ]
    .join(" ")
    .toLowerCase();

  const banned = ["as an ai", "lorem ipsum", "todo", "n/a", "unknown", "cannot determine"];
  const hasBanned = banned.some((term) => text.includes(term));

  return {
    key: "lowQualityPhrases",
    passed: !hasBanned,
    score: hasBanned ? 0 : 1,
    reason: hasBanned
      ? "Response includes placeholder or low-quality phrases."
      : "No placeholder phrases detected."
  };
}

export function assessAiEnhancementQuality(
  input: GeneratorFormValues,
  enhancement: AiEnhancementPayload
): AiQualityAssessment {
  const checks: QualityCheckResult[] = [
    checkMinLength("wcagCriterion", enhancement.wcagCriterion, 3, "WCAG criterion"),
    checkMinLength("actualBehavior", enhancement.actualBehavior, 10, "Actual behavior"),
    checkMinLength("expectedBehavior", enhancement.expectedBehavior, 10, "Expected behavior"),
    checkMinLength("affectedUsers", enhancement.affectedUsers, 3, "Affected users"),
    checkMinLength("problem", enhancement.problem, 18, "Problem summary"),
    checkMinLength("whyItMatters", enhancement.whyItMatters, 18, "Why-it-matters summary"),
    checkMinLength("codeExample", enhancement.codeExample, 12, "Code example"),
    checkHowToFix(enhancement.howToFix),
    checkNoLowQualityPhrases(enhancement)
  ];

  const structuralScore =
    checks.reduce((acc, check) => acc + check.score, 0) / checks.length;

  const alignmentScore =
    (overlapScore(input.actualBehavior, enhancement.actualBehavior) +
      overlapScore(input.expectedBehavior, enhancement.expectedBehavior) +
      overlapScore(input.component, enhancement.problem)) /
    3;

  const providerConfidence = Number.isFinite(enhancement.confidenceScore)
    ? Math.min(Math.max(enhancement.confidenceScore, 0), 1)
    : 0.5;

  const score = Math.min(
    0.58 * structuralScore + 0.22 * alignmentScore + 0.2 * providerConfidence,
    1
  );

  const missingCritical = checks.some(
    (check) =>
      !check.passed &&
      ["wcagCriterion", "actualBehavior", "expectedBehavior", "howToFix"].includes(check.key)
  );

  const passed = !missingCritical && score >= MIN_ACCEPT_SCORE;
  const reasons = checks.filter((check) => !check.passed).map((check) => check.reason);

  return {
    score,
    passed,
    checks,
    reasons
  };
}

export function buildRuleFallbackEnhancement(
  input: GeneratorFormValues,
  ruleInsight: GeneratedInsight,
  reason?: string
): AiEnhancementPayload {
  const fallbackNote = reason ? `AI quality fallback: ${reason}` : "AI quality fallback was used.";

  return {
    wcagCriterion: ruleInsight.suggestedWcag || input.wcagCriterion,
    actualBehavior: input.actualBehavior,
    expectedBehavior: input.expectedBehavior,
    affectedUsers: input.affectedUsers,
    problem: ruleInsight.problem,
    whyItMatters: ruleInsight.whyItMatters,
    howToFix: ruleInsight.howToFix,
    codeExample: ruleInsight.codeExample,
    notes: [input.notes ?? "", fallbackNote].filter(Boolean).join("\n"),
    confidenceScore: Math.min(Math.max(ruleInsight.confidenceScore + 0.08, 0.4), 0.92)
  };
}

export function applyQualityLayer(
  input: GeneratorFormValues,
  aiEnhancement: AiEnhancementPayload,
  ruleInsight: GeneratedInsight
): AiQualityDecision {
  const quality = assessAiEnhancementQuality(input, aiEnhancement);

  if (quality.passed) {
    return {
      usedFallback: false,
      quality,
      enhancement: aiEnhancement,
      strategy: "ai"
    };
  }

  const fallbackReason = quality.reasons[0] ?? "AI response quality below threshold.";

  return {
    usedFallback: true,
    reason: fallbackReason,
    quality,
    enhancement: buildRuleFallbackEnhancement(input, ruleInsight, fallbackReason),
    strategy: "rule-fallback"
  };
}
