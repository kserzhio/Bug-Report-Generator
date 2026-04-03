import { normalizeLocale } from "@/lib/i18n/locale";
import { prisma } from "@/lib/prisma/client";

export async function getWorkspaceLocale(workspaceId: string) {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { uiLocale: true }
  });

  return normalizeLocale(workspace?.uiLocale ?? "en");
}
