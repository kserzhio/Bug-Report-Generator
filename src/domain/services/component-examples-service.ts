import { defaultComponentIssueSeeds } from "@/src/domain/services/component-issue-seeds";

export type ComponentExampleSummary = {
  component: string;
  issueCount: number;
  topCriteria: string[];
  criticalCount: number;
};

export function getAllExampleComponents() {
  return Array.from(new Set(defaultComponentIssueSeeds.map((item) => item.componentKey.toLowerCase().trim()))).sort();
}

export function getComponentExampleSummaryList(): ComponentExampleSummary[] {
  return getAllExampleComponents().map((component) => {
    const issues = defaultComponentIssueSeeds.filter((item) => item.componentKey.toLowerCase() === component);
    const criteria = Array.from(
      new Set(
        issues.flatMap((item) =>
          item.wcagCriterion
            .split(";")
            .map((entry) => entry.trim())
            .filter(Boolean)
        )
      )
    ).slice(0, 3);

    return {
      component,
      issueCount: issues.length,
      topCriteria: criteria,
      criticalCount: issues.filter((item) => item.severity === "Critical").length
    };
  });
}

export function getComponentExampleIssues(component: string) {
  const normalized = component.toLowerCase().trim();

  return defaultComponentIssueSeeds
    .filter((item) => item.componentKey.toLowerCase() === normalized)
    .sort((left, right) => {
      const rank = { Critical: 4, High: 3, Medium: 2, Low: 1 };
      return rank[right.severity] - rank[left.severity];
    });
}
