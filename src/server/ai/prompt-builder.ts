import type { GeneratorFormValues } from "@/src/validation/generator";

export const AI_PROMPT_VERSION = "v1";

export function buildAiEnhancementPrompt(values: GeneratorFormValues) {
  return `Analyze this accessibility / QA bug input and return JSON only.

Required JSON shape:
{
  "wcagCriterion": "string",
  "actualBehavior": "string",
  "expectedBehavior": "string",
  "affectedUsers": "string",
  "problem": "string",
  "whyItMatters": "string",
  "howToFix": ["string", "string"],
  "codeExample": "string",
  "notes": "string",
  "confidenceScore": 0.0
}

Requirements:
- Keep the advice practical for QA and developers.
- Suggest the most relevant WCAG criterion.
- Improve the bug wording but do not invent product-specific facts.
- Make the fix guidance concrete.
- Prefer HTML/ARIA/JS examples when relevant.
- If information is missing, make a cautious best-effort guess.
- confidenceScore must be a number from 0 to 1 that reflects how confident you are in the suggestion.

Input:
Issue type: ${values.issueType}
Severity: ${values.severity}
WCAG version: ${values.wcagVersion}
Component: ${values.component}
Screen/Page: ${values.screenName}
Affected users: ${values.affectedUsers}
Actual behavior: ${values.actualBehavior}
Expected behavior: ${values.expectedBehavior}
WCAG criterion: ${values.wcagCriterion}
Tools used: ${values.toolsUsed}
Notes: ${values.notes ?? ""}`;
}
