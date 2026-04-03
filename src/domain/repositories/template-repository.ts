import type { BugTemplate } from "@prisma/client";

export interface TemplateRepository {
  findAll(workspaceId: string): Promise<BugTemplate[]>;
  findDefaultTemplates(): Promise<BugTemplate[]>;
}
