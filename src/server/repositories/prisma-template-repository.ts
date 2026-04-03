import type { BugTemplate } from "@prisma/client";

import { prisma } from "@/lib/prisma/client";
import type { TemplateRepository } from "@/src/domain/repositories/template-repository";

export class PrismaTemplateRepository implements TemplateRepository {
  async findAll(workspaceId: string): Promise<BugTemplate[]> {
    return prisma.bugTemplate.findMany({
      where: {
        OR: [{ workspaceId }, { isSystem: true }]
      },
      orderBy: [{ isSystem: "desc" }, { title: "asc" }]
    });
  }

  async findDefaultTemplates(): Promise<BugTemplate[]> {
    return prisma.bugTemplate.findMany({
      where: { isSystem: true },
      orderBy: { title: "asc" }
    });
  }
}
