import Link from "next/link";
import { notFound } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getMessages } from "@/lib/i18n/messages";
import { normalizeLocale } from "@/lib/i18n/locale";
import { prisma } from "@/lib/prisma/client";
import { getCurrentWorkspaceContext } from "@/src/server/queries/workspace";

export default async function ProjectDetailsPage({
  params
}: {
  params: Promise<{ projectId: string }>;
}) {
  const context = await getCurrentWorkspaceContext();
  const { projectId } = await params;
  const locale = normalizeLocale(context.workspace.uiLocale);
  const t = getMessages(locale);
  const c =
    locale === "uk"
      ? {
          noDescription: "Опис ще не додано. Використовуйте цей view для організації роботи з багами.",
          newBug: "Новий баг для проєкту",
          viewHistory: "Переглянути в історії",
          totalBugs: "Всього багів",
          criticalHigh: "Critical + High",
          lastUpdated: "Останнє оновлення",
          noBugsYet: "Ще немає багів",
          projectNoBugs: "У цьому проєкті ще немає bug-репортів.",
          openEdit: "Відкрити і редагувати",
          duplicate: "Дублювати",
          severity: "Серйозність",
          component: "Компонент"
        }
      : {
          noDescription: "No description yet. Use this project view to keep bug work organized.",
          newBug: "New bug for project",
          viewHistory: "View in history",
          totalBugs: "Total bugs",
          criticalHigh: "Critical + High",
          lastUpdated: "Last updated",
          noBugsYet: "No bugs yet",
          projectNoBugs: "This project does not have bug reports yet.",
          openEdit: "Open & edit",
          duplicate: "Duplicate",
          severity: "Severity",
          component: "Component"
        };

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      workspaceId: context.workspace.id
    },
    include: {
      bugs: {
        orderBy: [{ updatedAt: "desc" }]
      },
      _count: {
        select: { bugs: true }
      }
    }
  });

  if (!project) {
    notFound();
  }

  const criticalOrHigh = project.bugs.filter((bug) => bug.severity === "Critical" || bug.severity === "High").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">{t.dashboard.projectsTitle}</p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">{project.name}</h1>
          <p className="text-sm text-muted-foreground">{project.description || c.noDescription}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/dashboard/generator?projectId=${project.id}`} className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
            {c.newBug}
          </Link>
          <Link href={`/dashboard/history?projectId=${project.id}`} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">
            {c.viewHistory}
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">{c.totalBugs}</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">{project._count.bugs}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">{c.criticalHigh}</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">{criticalOrHigh}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">{c.lastUpdated}</p>
            <p className="mt-3 text-base font-semibold text-slate-950">
              {project.bugs[0] ? new Date(project.bugs[0].updatedAt).toLocaleString() : c.noBugsYet}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {project.bugs.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-sm text-muted-foreground">{c.projectNoBugs}</CardContent>
          </Card>
        ) : null}

        {project.bugs.map((bug) => (
          <Card key={bug.id}>
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>{bug.title}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {new Date(bug.updatedAt).toLocaleString()} • {bug.screenName}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href={`/dashboard/generator?bugId=${bug.id}`} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">
                  {c.openEdit}
                </Link>
                <Link href={`/dashboard/generator?duplicateId=${bug.id}`} className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
                  {c.duplicate}
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-600">
              <p>{c.severity}: {bug.severity}</p>
              <p>WCAG {bug.wcagVersion}: {bug.wcagCriterion}</p>
              <p>{c.component}: {bug.component}</p>
              <p>{bug.actualBehavior}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
