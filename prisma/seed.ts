import { PrismaClient } from "@prisma/client";

import { defaultComponentIssueSeeds } from "@/src/domain/services/component-issue-seeds";
import { defaultTemplateSeeds } from "@/src/domain/services/template-service";

const prisma = new PrismaClient();

async function main() {
  for (const template of defaultTemplateSeeds) {
    await prisma.bugTemplate.upsert({
      where: { slug: template.slug },
      update: {
        title: template.title,
        category: template.category,
        description: template.description,
        severity: template.severity,
        actualBehavior: template.actualBehavior,
        expectedBehavior: template.expectedBehavior,
        wcagCriterion: template.wcagCriterion,
        toolsUsed: template.toolsUsed,
        isSystem: true
      },
      create: {
        ...template,
        issueType: "Accessibility",
        isSystem: true
      }
    });
  }

  for (const issue of defaultComponentIssueSeeds) {
    await prisma.componentIssueSuggestion.upsert({
      where: { slug: issue.slug },
      update: {
        componentKey: issue.componentKey,
        category: issue.category,
        tags: issue.tags,
        title: issue.title,
        severity: issue.severity,
        affectedUsers: issue.affectedUsers,
        actualBehavior: issue.actualBehavior,
        expectedBehavior: issue.expectedBehavior,
        wcagCriterion: issue.wcagCriterion,
        notes: issue.notes,
        isSystem: true
      },
      create: {
        ...issue,
        isSystem: true
      }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });


