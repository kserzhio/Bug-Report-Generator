import type { GeneratorFormValues } from "@/src/validation/generator";

function normalizeLines(value: string | undefined) {
  return (value ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function buildEvidenceSection(values: GeneratorFormValues) {
  const reproductionSteps = normalizeLines(values.reproductionSteps);
  const screenshots = normalizeLines(values.screenshotUrls);
  const lines: string[] = [];

  if (reproductionSteps.length > 0) {
    lines.push("### Reproduction Steps");
    reproductionSteps.forEach((step, index) => {
      lines.push(`${index + 1}. ${step}`);
    });
    lines.push("");
  }

  const envRows = [
    values.browserInfo ? `- Browser: ${values.browserInfo}` : null,
    values.operatingSystem ? `- OS: ${values.operatingSystem}` : null,
    values.deviceInfo ? `- Device: ${values.deviceInfo}` : null,
    values.assistiveTechnology ? `- Assistive technology: ${values.assistiveTechnology}` : null
  ].filter(Boolean) as string[];

  if (envRows.length > 0) {
    lines.push("### Environment");
    lines.push(...envRows);
    lines.push("");
  }

  if (values.videoUrl?.trim()) {
    lines.push("### Video");
    lines.push(values.videoUrl.trim());
    lines.push("");
  }

  if (screenshots.length > 0) {
    lines.push("### Screenshots");
    screenshots.forEach((url) => lines.push(`- ${url}`));
    lines.push("");
  }

  if (lines.length === 0) {
    return "";
  }

  return `\n## Evidence\n${lines.join("\n").trimEnd()}`;
}

export function formatBugReport(values: GeneratorFormValues) {
  const evidenceSection = buildEvidenceSection(values);
  const notesSection = values.notes?.trim() ? `\n## Notes\n${values.notes.trim()}` : "";

  return `# ${values.issueType} Bug Report

## Severity
${values.severity}

## Defect Description
${values.actualBehavior}

## Actual Result
- Observed behavior: ${values.actualBehavior}
- Affected users: ${values.affectedUsers}
- Component: ${values.component}

## Expected Result
${values.expectedBehavior}

## WCAG Criteria
WCAG ${values.wcagVersion}: ${values.wcagCriterion}

## Tools Used
${values.toolsUsed}

## Screen Name
${values.screenName}${evidenceSection}${notesSection}
`;
}