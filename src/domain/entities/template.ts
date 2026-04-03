export type TemplateCategory =
  | "forms"
  | "dialogs"
  | "navigation"
  | "tables"
  | "status-messages"
  | "keyboard"
  | "screen-reader";

export interface BugTemplateSeed {
  title: string;
  slug: string;
  category: TemplateCategory;
  description: string;
  actualBehavior: string;
  expectedBehavior: string;
  wcagCriterion: string;
  toolsUsed: string;
  severity: "Low" | "Medium" | "High" | "Critical";
}
