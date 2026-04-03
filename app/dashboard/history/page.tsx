import Link from "next/link";

import { HistoryBulkActions } from "@/components/dashboard/history-bulk-actions";
import { HistoryRowActions } from "@/components/dashboard/history-row-actions";
import { SavedViewsBar } from "@/components/dashboard/saved-views-bar";
import { getMessages } from "@/lib/i18n/messages";
import { normalizeLocale } from "@/lib/i18n/locale";
import { prisma } from "@/lib/prisma/client";
import { getCurrentWorkspaceContext } from "@/src/server/queries/workspace";

type HistoryBug = {
  id: string;
  title: string;
  severity: string;
  wcagVersion: string;
  wcagCriterion: string;
  component: string;
  screenName: string;
  notes: string | null;
  projectId: string | null;
  videoUrl: string | null;
  screenshotUrls: string | null;
  updatedAt: Date;
  project: {
    id: string;
    name: string;
  } | null;
};

const severityConfig: Record<string, { color: string; bg: string; border: string }> = {
  Critical: { color: "#E41F07", bg: "rgba(228,31,7,0.12)", border: "rgba(228,31,7,0.2)" },
  High: { color: "#F97316", bg: "rgba(249,115,22,0.12)", border: "rgba(249,115,22,0.2)" },
  Medium: { color: "#EAB308", bg: "rgba(234,179,8,0.12)", border: "rgba(234,179,8,0.2)" },
  Low: { color: "#22C55E", bg: "rgba(34,197,94,0.12)", border: "rgba(34,197,94,0.2)" }
};

function formatRelative(date: Date, locale: "en" | "uk") {
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.max(1, Math.floor(diffMs / 60000));

  if (minutes < 60) {
    return locale === "uk" ? `${minutes} хв тому` : `${minutes} min ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return locale === "uk" ? `${hours} год тому` : `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }

  const days = Math.floor(hours / 24);

  if (days === 1) {
    return locale === "uk" ? "Вчора" : "Yesterday";
  }

  return locale === "uk" ? `${days} дн тому` : `${days} days ago`;
}

function qualityScore(item: HistoryBug) {
  const baseBySeverity: Record<string, number> = {
    Critical: 94,
    High: 88,
    Medium: 81,
    Low: 86
  };

  const base = baseBySeverity[item.severity] ?? 80;
  const evidenceBoost = item.videoUrl || item.screenshotUrls ? 2 : 0;
  const notesBoost = item.notes?.trim() ? 1 : 0;

  return Math.min(99, base + evidenceBoost + notesBoost);
}

function scoreBarColor(score: number) {
  if (score >= 90) return "#10B981";
  if (score >= 75) return "#EAB308";
  return "#E41F07";
}

export default async function HistoryPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; severity?: string; wcag?: string; component?: string; projectId?: string }>;
}) {
  const context = await getCurrentWorkspaceContext();
  const params = await searchParams;
  const locale = normalizeLocale(context.workspace.uiLocale);
  const t = getMessages(locale);
  const c =
    locale === "uk"
      ? {
          allSeverities: "Усі рівні",
          allProjects: "Усі проєкти",
          noProject: "Без проєкту",
          searchPlaceholder: "Пошук репортів...",
          filterWcag: "WCAG",
          filterComponent: "Компонент",
          apply: "Застосувати",
          reports: "репортів",
          report: "Репорт",
          project: "Проєкт",
          type: "Тип",
          severity: "Серйозність",
          score: "Score",
          date: "Дата",
          noSaved: "Немає репортів за поточними фільтрами.",
          evidence: "Докази",
          exported: "Збережено",
          draft: "Чернетка",
          accessibility: "Accessibility"
        }
      : {
          allSeverities: "All severities",
          allProjects: "All projects",
          noProject: "No project",
          searchPlaceholder: "Search reports...",
          filterWcag: "WCAG",
          filterComponent: "Component",
          apply: "Apply",
          reports: "reports",
          report: "Report",
          project: "Project",
          type: "Type",
          severity: "Severity",
          score: "Score",
          date: "Date",
          noSaved: "No reports match the current filters.",
          evidence: "Evidence",
          exported: "Saved",
          draft: "Draft",
          accessibility: "Accessibility"
        };

  const q = params.q?.trim() ?? "";
  const severity = params.severity?.trim() ?? "";
  const wcag = params.wcag?.trim() ?? "";
  const component = params.component?.trim() ?? "";
  const projectId = params.projectId?.trim() ?? "";

  const [projectSummaries, historyItems, savedViews] = await Promise.all([
    prisma.project.findMany({
      where: { workspaceId: context.workspace.id },
      include: {
        _count: {
          select: { bugs: true }
        }
      },
      orderBy: [{ updatedAt: "desc" }]
    }),
    prisma.generatedBug.findMany({
      where: {
        workspaceId: context.workspace.id,
        ...(projectId ? { projectId } : {}),
        ...(severity ? { severity } : {}),
        ...(wcag ? { wcagCriterion: { contains: wcag, mode: "insensitive" } } : {}),
        ...(component ? { component: { contains: component, mode: "insensitive" } } : {}),
        ...(q
          ? {
              OR: [
                { title: { contains: q, mode: "insensitive" } },
                { severity: { contains: q, mode: "insensitive" } },
                { wcagCriterion: { contains: q, mode: "insensitive" } },
                { screenName: { contains: q, mode: "insensitive" } },
                { project: { name: { contains: q, mode: "insensitive" } } }
              ]
            }
          : {})
      },
      select: {
        id: true,
        title: true,
        severity: true,
        wcagVersion: true,
        wcagCriterion: true,
        component: true,
        screenName: true,
        notes: true,
        projectId: true,
        videoUrl: true,
        screenshotUrls: true,
        updatedAt: true,
        project: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: [{ updatedAt: "desc" }]
    }),
    prisma.savedView.findMany({
      where: {
        workspaceId: context.workspace.id,
        scope: "HISTORY",
        OR: [{ userId: context.currentUserId }, { visibility: "WORKSPACE" }]
      },
      select: {
        id: true,
        name: true,
        queryString: true,
        visibility: true,
        userId: true,
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: [{ visibility: "desc" }, { createdAt: "desc" }]
    })
  ]);

  const projectOptions = [{ label: c.noProject, value: "" }].concat(
    projectSummaries.map((project) => ({
      label: project.name,
      value: project.id
    }))
  );

  const currentQueryString = new URLSearchParams(
    Object.entries({ q, severity, wcag, component, projectId }).filter(([, value]) => Boolean(value)) as Array<[string, string]>
  ).toString();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">{t.dashboard.historyTitle}</h1>
        <p className="text-sm text-muted-foreground">{t.dashboard.historySubtitle}</p>
      </div>

      <form className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <input
            name="q"
            defaultValue={q}
            placeholder={c.searchPlaceholder}
            className="h-9 w-64 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white placeholder:text-zinc-500 focus:border-[#E41F07]/40 focus:outline-none focus:ring-2 focus:ring-[#E41F07]/30"
          />
          <div className="relative">
            <select
              name="severity"
              defaultValue={severity || ""}
              className="h-9 min-w-36 appearance-none rounded-lg border border-white/10 bg-white/5 pl-3 pr-8 text-sm text-zinc-300 focus:border-[#E41F07]/40 focus:outline-none focus:ring-2 focus:ring-[#E41F07]/30"
            >
              <option value="" style={{ background: "#151A21" }}>{c.allSeverities}</option>
              <option value="Critical" style={{ background: "#151A21" }}>Critical</option>
              <option value="High" style={{ background: "#151A21" }}>High</option>
              <option value="Medium" style={{ background: "#151A21" }}>Medium</option>
              <option value="Low" style={{ background: "#151A21" }}>Low</option>
            </select>
            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-zinc-500">▾</span>
          </div>
          <input type="hidden" name="wcag" defaultValue={wcag} />
          <input type="hidden" name="component" defaultValue={component} />
          <input type="hidden" name="projectId" defaultValue={projectId} />
          <button className="h-9 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground">{c.apply}</button>
        </div>
        <p className="text-xs text-zinc-500">{historyItems.length} {c.reports}</p>
      </form>

      <div className="overflow-hidden rounded-xl border border-white/10 bg-[#151A21]">
        <div className="grid grid-cols-[1.8fr_1fr_0.8fr_0.7fr_0.8fr_0.8fr_auto] gap-4 border-b border-white/5 px-5 py-3">
          {[c.report, c.project, c.type, c.severity, c.score, c.date, ""].map((header) => (
            <span key={header} className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
              {header}
            </span>
          ))}
        </div>

        <div className="divide-y divide-white/[0.04]">
          {historyItems.map((item) => {
            const sev = severityConfig[item.severity] ?? severityConfig.Medium;
            const score = qualityScore(item);
            const barColor = scoreBarColor(score);
            const hasEvidence = Boolean(item.videoUrl?.trim()) || Boolean(item.screenshotUrls?.trim());

            return (
              <div
                key={item.id}
                className="group grid grid-cols-[1.8fr_1fr_0.8fr_0.7fr_0.8fr_0.8fr_auto] items-center gap-4 px-5 py-4 transition-colors hover:bg-white/[0.025]"
              >
                <div className="min-w-0">
                  <div className="mb-0.5 flex items-center gap-2">
                    <span className="font-mono text-[10px] text-zinc-600">{item.id.slice(0, 12).toUpperCase()}</span>
                    <span className={`text-[9px] ${hasEvidence ? "text-emerald-400" : "text-zinc-500"}`}>
                      {hasEvidence ? c.exported : c.draft}
                    </span>
                  </div>
                  <p className="truncate text-sm text-white">{item.title}</p>
                </div>

                <span className="truncate text-xs text-zinc-400">{item.project?.name ?? c.noProject}</span>
                <span className="text-xs text-zinc-500">{c.accessibility}</span>

                <span
                  className="w-fit rounded px-2 py-0.5 text-[10px] font-semibold"
                  style={{ background: sev.bg, color: sev.color, border: `1px solid ${sev.border}` }}
                >
                  {item.severity}
                </span>

                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-16 overflow-hidden rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${score}%`, background: `linear-gradient(90deg, ${barColor}80, ${barColor})` }}
                    />
                  </div>
                  <span className="text-xs font-medium" style={{ color: barColor }}>{score}</span>
                </div>

                <span className="text-xs text-zinc-600">{formatRelative(item.updatedAt, locale)}</span>

                <HistoryRowActions
                  bugId={item.id}
                  openHref={`/dashboard/generator?bugId=${item.id}`}
                  duplicateHref={`/dashboard/generator?duplicateId=${item.id}`}
                />
              </div>
            );
          })}
        </div>

        {historyItems.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-zinc-500">{c.noSaved}</p>
          </div>
        ) : null}
      </div>

      <SavedViewsBar
        scope="HISTORY"
        currentQueryString={currentQueryString}
        currentUserId={context.currentUserId}
        canManageWorkspaceViews={context.currentRole === "OWNER" || context.currentRole === "ADMIN"}
        views={savedViews.map((view) => ({
          id: view.id,
          name: view.name,
          queryString: view.queryString,
          visibility: view.visibility,
          isOwnedByCurrentUser: view.userId === context.currentUserId,
          ownerLabel: view.user.name?.trim() || view.user.email
        }))}
      />

      <HistoryBulkActions
        items={historyItems.map((item) => ({
          id: item.id,
          title: item.title,
          severity: item.severity,
          projectId: item.projectId
        }))}
        projectOptions={projectOptions}
      />

      <details className="rounded-xl border border-white/10 bg-[#111827]/70 p-4">
        <summary className="cursor-pointer text-sm font-medium text-slate-200">
          {locale === "uk" ? "Розширені фільтри" : "Advanced filters"}
        </summary>
        <form className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto]">
          <select
            name="projectId"
            defaultValue={projectId}
            className="h-10 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-zinc-300"
          >
            {projectOptions.map((option) => (
              <option key={option.value || "all"} value={option.value} style={{ background: "#151A21" }}>
                {option.label}
              </option>
            ))}
          </select>
          <input name="wcag" defaultValue={wcag} placeholder={c.filterWcag} className="h-10 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-zinc-300" />
          <input name="component" defaultValue={component} placeholder={c.filterComponent} className="h-10 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-zinc-300" />
          <div className="flex gap-2">
            <input type="hidden" name="q" defaultValue={q} />
            <input type="hidden" name="severity" defaultValue={severity} />
            <button className="h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground">{c.apply}</button>
            <Link href="/dashboard/history" className="inline-flex h-10 items-center rounded-lg border border-white/10 px-4 text-sm text-zinc-300">
              Reset
            </Link>
          </div>
        </form>
      </details>
    </div>
  );
}

