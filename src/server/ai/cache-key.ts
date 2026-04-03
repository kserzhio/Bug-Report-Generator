import { createHash } from "crypto";

import type { GeneratorFormValues } from "@/src/validation/generator";

export function buildAiCacheKey(values: GeneratorFormValues, promptVersion: string) {
  const normalized = JSON.stringify({
    issueType: values.issueType,
    severity: values.severity,
    wcagVersion: values.wcagVersion,
    component: values.component.trim().toLowerCase(),
    screenName: values.screenName.trim().toLowerCase(),
    affectedUsers: values.affectedUsers.trim().toLowerCase(),
    actualBehavior: values.actualBehavior.trim().toLowerCase(),
    expectedBehavior: values.expectedBehavior.trim().toLowerCase(),
    wcagCriterion: values.wcagCriterion.trim().toLowerCase(),
    toolsUsed: values.toolsUsed.trim().toLowerCase(),
    notes: (values.notes ?? "").trim().toLowerCase(),
    promptVersion
  });

  return createHash("sha256").update(normalized).digest("hex");
}
