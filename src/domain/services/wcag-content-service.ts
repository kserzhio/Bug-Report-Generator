import { defaultComponentIssueSeeds } from "@/src/domain/services/component-issue-seeds";
import { defaultTemplateSeeds } from "@/src/domain/services/template-service";

type WcagSourceRecord = {
  criterionText: string;
  component?: string;
  sourceTitle: string;
};

export type WcagCriterionSummary = {
  code: string;
  title: string;
  mentionCount: number;
  components: string[];
  examples: string[];
};

function extractCriterionParts(raw: string) {
  const parts = raw
    .split(/[;,]/g)
    .map((item) => item.trim())
    .filter(Boolean);

  return parts
    .map((part) => {
      const match = part.match(/^(\d+\.\d+\.\d+)\s*(.*)$/);

      if (!match) {
        return null;
      }

      const code = match[1];
      const title = match[2]?.trim() || "WCAG criterion";
      return { code, title };
    })
    .filter((item): item is { code: string; title: string } => Boolean(item));
}

function buildSourceRecords(): WcagSourceRecord[] {
  const issueRecords: WcagSourceRecord[] = defaultComponentIssueSeeds.map((item) => ({
    criterionText: item.wcagCriterion,
    component: item.componentKey.toLowerCase(),
    sourceTitle: item.title
  }));

  const templateRecords: WcagSourceRecord[] = defaultTemplateSeeds.map((item) => ({
    criterionText: item.wcagCriterion,
    component: item.category.toLowerCase(),
    sourceTitle: item.title
  }));

  return [...issueRecords, ...templateRecords];
}

export function getWcagCriteriaSummaries(): WcagCriterionSummary[] {
  const byCode = new Map<
    string,
    {
      title: string;
      mentionCount: number;
      components: Set<string>;
      examples: Set<string>;
    }
  >();

  for (const record of buildSourceRecords()) {
    const criteria = extractCriterionParts(record.criterionText);

    for (const criterion of criteria) {
      const current =
        byCode.get(criterion.code) ??
        {
          title: criterion.title,
          mentionCount: 0,
          components: new Set<string>(),
          examples: new Set<string>()
        };

      current.mentionCount += 1;

      if (record.component) {
        current.components.add(record.component);
      }

      current.examples.add(record.sourceTitle);
      byCode.set(criterion.code, current);
    }
  }

  return Array.from(byCode.entries())
    .map(([code, value]) => ({
      code,
      title: value.title,
      mentionCount: value.mentionCount,
      components: Array.from(value.components).sort(),
      examples: Array.from(value.examples).slice(0, 6)
    }))
    .sort((left, right) => left.code.localeCompare(right.code, undefined, { numeric: true }));
}

export function getWcagCriterionSummaryByCode(code: string) {
  return getWcagCriteriaSummaries().find((item) => item.code === code);
}

export function extractWcagCodesFromText(value: string) {
  return Array.from(new Set((value.match(/\b\d+\.\d+\.\d+\b/g) ?? []).map((item) => item.trim()))).sort((left, right) =>
    left.localeCompare(right, undefined, { numeric: true })
  );
}
