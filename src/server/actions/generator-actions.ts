"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma/client";
import { formatBugReport } from "@/src/domain/services/bug-report-service";
import {
  type GeneratorFormValues,
  generatorSchema
} from "@/src/validation/generator";

export async function saveGeneratedBug(values: GeneratorFormValues) {
  const session = await auth();

  if (!session?.user?.id || !session.user.workspaceId) {
    throw new Error("Unauthorized");
  }

  const payload = generatorSchema.parse(values);
  const content = formatBugReport(payload);

  await prisma.generatedBug.create({
    data: {
      workspaceId: session.user.workspaceId,
      userId: session.user.id,
      projectId: payload.projectId || null,
      title: `${payload.screenName}: ${payload.component}`,
      issueType: payload.issueType,
      severity: payload.severity,
      wcagVersion: payload.wcagVersion,
      component: payload.component,
      screenName: payload.screenName,
      affectedUsers: payload.affectedUsers,
      actualBehavior: payload.actualBehavior,
      expectedBehavior: payload.expectedBehavior,
      wcagCriterion: payload.wcagCriterion,
      toolsUsed: payload.toolsUsed,
      notes: payload.notes,
      markdownContent: content
    }
  });

  revalidatePath("/dashboard/history");
  return { success: true };
}
