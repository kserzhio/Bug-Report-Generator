export type IssueType =
  | "Accessibility"
  | "Functional"
  | "Usability"
  | "Visual"
  | "Regression";

export type SeverityLevel = "Low" | "Medium" | "High" | "Critical";

export interface GeneratedBugDraft {
  issueType: IssueType;
  severity: SeverityLevel;
  component: string;
  screenName: string;
  affectedUsers: string;
  actualBehavior: string;
  expectedBehavior: string;
  wcagCriterion: string;
  toolsUsed: string;
  notes?: string;
}
