import type { GeneratorFormValues } from "@/src/validation/generator";

export type RewriteMode = "formal" | "simple" | "developer" | "client";

const prefixes: Record<RewriteMode, string> = {
  formal: "Formal enterprise tone",
  simple: "Simple English",
  developer: "Developer-friendly tone",
  client: "Client-friendly tone"
};

function summarizeEvidence(values: GeneratorFormValues) {
  const evidenceParts = [
    values.reproductionSteps?.trim() ? "reproduction steps included" : null,
    values.browserInfo?.trim() ? `browser ${values.browserInfo.trim()}` : null,
    values.operatingSystem?.trim() ? `OS ${values.operatingSystem.trim()}` : null,
    values.deviceInfo?.trim() ? `device ${values.deviceInfo.trim()}` : null,
    values.assistiveTechnology?.trim() ? `AT ${values.assistiveTechnology.trim()}` : null,
    values.videoUrl?.trim() ? "video attached" : null,
    values.screenshotUrls?.trim() ? "screenshots attached" : null
  ].filter(Boolean) as string[];

  return evidenceParts.length > 0 ? evidenceParts.join(", ") : "no additional evidence attached";
}

export function rewriteBugReport(
  values: GeneratorFormValues,
  baseContent: string,
  mode: RewriteMode
) {
  const evidence = summarizeEvidence(values);

  if (mode === "formal") {
    return `${prefixes[mode]}\n\n${baseContent}`;
  }

  if (mode === "simple") {
    return `Simple English summary\n\nSeverity: ${values.severity}\nIssue: ${values.actualBehavior}\nExpected: ${values.expectedBehavior}\nWCAG ${values.wcagVersion}: ${values.wcagCriterion}\nAffected users: ${values.affectedUsers}\nEvidence: ${evidence}`;
  }

  if (mode === "developer") {
    return `Developer-ready summary\n\nBug: ${values.actualBehavior}\nExpected system behavior: ${values.expectedBehavior}\nComponent: ${values.component}\nPage: ${values.screenName}\nWCAG ${values.wcagVersion} mapping: ${values.wcagCriterion}\nSuggested investigation: reproduce with ${values.toolsUsed}.\nEvidence: ${evidence}.`;
  }

  return `Client-friendly summary\n\nA user-facing accessibility issue was found on ${values.screenName}.\nCurrent behavior: ${values.actualBehavior}\nExpected experience: ${values.expectedBehavior}\nImpact: ${values.affectedUsers}\nSeverity: ${values.severity}\nEvidence: ${evidence}.`;
}

export function formatVpatOutput(values: GeneratorFormValues) {
  const status = values.severity === "Critical" || values.severity === "High"
    ? "Does Not Support"
    : values.severity === "Medium"
      ? "Partially Supports"
      : "Supports";

  return `# VPAT Assessment\n\n## Conformance Level\n${status}\n\n## Remarks & Explanations\n- Component: ${values.component}\n- Screen/Page: ${values.screenName}\n- Issue summary: ${values.actualBehavior}\n- Expected accessible behavior: ${values.expectedBehavior}\n- WCAG ${values.wcagVersion} reference: ${values.wcagCriterion}\n- Tools used: ${values.toolsUsed}\n- Evidence: ${summarizeEvidence(values)}\n- Notes: ${values.notes || "N/A"}`;
}