import Link from "next/link";
import { FolderKanban, Bug, TrendingUp, Search, Plus, Calendar, ChevronRight } from "lucide-react";

import { ProjectForm } from "@/components/dashboard/project-form";
import { getMessages } from "@/lib/i18n/messages";
import { normalizeLocale } from "@/lib/i18n/locale";
import { prisma } from "@/lib/prisma/client";
import { getCurrentWorkspaceContext } from "@/src/server/queries/workspace";

function initialsFromName(name: string) {
  const parts = name
    .split(" ")
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

function relativeTime(value: Date, locale: "en" | "uk") {
  const diffMs = Date.now() - value.getTime();
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
    return locale === "uk" ? "Yesterday" : "Yesterday";
  }

  return locale === "uk" ? `${days} дн тому` : `${days} days ago`;
}

function colorByIndex(index: number) {
  const palette = ["#E41F07", "#8B5CF6", "#06B6D4", "#F59E0B", "#10B981", "#71717A"];
  return palette[index % palette.length] ?? "#8B5CF6";
}

function memberGradient(index: number) {
  const gradients = [
    "from-purple-500 to-pink-500",
    "from-blue-500 to-cyan-500",
    "from-orange-400 to-red-500",
    "from-green-400 to-teal-500"
  ];

  return gradients[index % gradients.length] ?? gradients[0];
}

export default async function ProjectsPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const context = await getCurrentWorkspaceContext();
  const params = await searchParams;
  const locale = normalizeLocale(context.workspace.uiLocale);
  const t = getMessages(locale);

  const copy =
    locale === "uk"
      ? {
          all: "all",
          active: "active",
          completed: "completed",
          totalProjects: "Всього проєктів",
          openBugs: "Open Bugs",
          criticalIssues: "Critical Issues",
          searchPlaceholder: "Пошук проєктів...",
          newProject: "Новий проєкт",
          createNewProject: "Створити новий проєкт",
          total: "Всього",
          open: "Open",
          critical: "Critical",
          progress: "Прогрес",
          openLabel: "Відкрити",
          noDescription: "Опис ще не додано.",
          noProjects: "Немає проєктів за поточним фільтром.",
          viewDetails: "View details",
          history: "History",
          generator: "Generator"
        }
      : {
          all: "all",
          active: "active",
          completed: "completed",
          totalProjects: "Total Projects",
          openBugs: "Open Bugs",
          criticalIssues: "Critical Issues",
          searchPlaceholder: "Search projects...",
          newProject: "New Project",
          createNewProject: "Create new project",
          total: "Total",
          open: "Open",
          critical: "Critical",
          progress: "Progress",
          openLabel: "Open",
          noDescription: "No description yet.",
          noProjects: "No projects match current filter.",
          viewDetails: "View details",
          history: "History",
          generator: "Generator"
        };

  const q = (params.q ?? "").trim().toLowerCase();
  const status = (params.status ?? "all").trim().toLowerCase();
  const activeStatus = status === "active" || status === "completed" ? status : "all";

  const projects = await prisma.project.findMany({
    where: { workspaceId: context.workspace.id },
    include: {
      bugs: {
        select: {
          id: true,
          severity: true,
          updatedAt: true
        },
        orderBy: { updatedAt: "desc" }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  const workspaceMembers = context.workspace.members.map((member) => {
    const rawName = member.user.name?.trim() || member.user.email || "User";
    return initialsFromName(rawName);
  });

  const prepared = projects.map((project, index) => {
    const bugsTotal = project.bugs.length;
    const bugsCritical = project.bugs.filter((bug) => bug.severity === "Critical").length;
    const bugsHigh = project.bugs.filter((bug) => bug.severity === "High").length;
    const bugsOpen = bugsTotal;
    const statusValue = bugsOpen === 0 ? "completed" : "active";
    const progress = bugsTotal === 0 ? 100 : Math.max(20, Math.min(95, Math.round(((bugsTotal - (bugsCritical + bugsHigh)) / bugsTotal) * 100)));
    const lastActive = project.bugs[0]?.updatedAt ?? project.updatedAt;

    return {
      id: project.id,
      name: project.name,
      description: project.description ?? copy.noDescription,
      bugsTotal,
      bugsCritical,
      bugsOpen,
      progress,
      status: statusValue,
      lastActive,
      color: colorByIndex(index),
      members: workspaceMembers
    };
  });

  const filtered = prepared.filter((project) => {
    const text = `${project.name} ${project.description}`.toLowerCase();
    const matchQuery = q.length === 0 || text.includes(q);
    const matchStatus = activeStatus === "all" || project.status === activeStatus;
    return matchQuery && matchStatus;
  });

  const totalOpen = prepared.reduce((sum, project) => sum + project.bugsOpen, 0);
  const totalCritical = prepared.reduce((sum, project) => sum + project.bugsCritical, 0);

  const filterHref = (value: "all" | "active" | "completed") => {
    const next = new URLSearchParams();
    if (q) next.set("q", q);
    if (value !== "all") next.set("status", value);
    const query = next.toString();
    return query ? `/dashboard/projects?${query}` : "/dashboard/projects";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">{t.dashboard.projectsTitle}</h1>
        <p className="text-sm text-muted-foreground">{t.dashboard.projectsSubtitle}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: copy.totalProjects, value: prepared.length, icon: FolderKanban, color: "#8B5CF6" },
          { label: copy.openBugs, value: totalOpen, icon: Bug, color: "#F97316" },
          { label: copy.criticalIssues, value: totalCritical, icon: TrendingUp, color: "#E41F07" }
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="flex items-center gap-4 rounded-xl border border-white/10 bg-[#151A21] px-5 py-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ background: `${color}15`, border: `1px solid ${color}20` }}>
              <Icon className="h-4 w-4" style={{ color }} />
            </div>
            <div>
              <p className="mb-1 text-xl font-bold leading-none text-white">{value}</p>
              <p className="text-xs text-zinc-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <form className="flex flex-wrap items-center gap-3">
          <input
            name="q"
            defaultValue={q}
            placeholder={copy.searchPlaceholder}
            className="h-9 w-56 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white placeholder:text-zinc-500 focus:border-[#E41F07]/40 focus:outline-none focus:ring-2 focus:ring-[#E41F07]/30"
          />
          <button className="h-9 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground">{locale === "uk" ? "Пошук" : "Search"}</button>
        </form>

        <div className="flex items-center gap-2">
          {(["all", "active", "completed"] as const).map((value) => (
            <Link
              key={value}
              href={filterHref(value)}
              className="h-8 rounded-lg border px-3 text-xs capitalize transition-all"
              style={
                activeStatus === value
                  ? { background: "rgba(228,31,7,0.12)", color: "#E41F07", borderColor: "rgba(228,31,7,0.25)" }
                  : { background: "rgba(255,255,255,0.04)", color: "#71717A", borderColor: "rgba(255,255,255,0.07)" }
              }
            >
              <span className="inline-flex h-full items-center">{value}</span>
            </Link>
          ))}
        </div>

        <a
          href="#project-form"
          className="inline-flex h-9 items-center gap-2 rounded-lg px-4 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-[#E41F07]/20"
          style={{ background: "linear-gradient(135deg, #E41F07, #B91804)" }}
        >
          <Plus className="h-4 w-4" />
          {copy.newProject}
        </a>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {filtered.map((project) => (
          <div
            key={project.id}
            className="group relative flex min-h-[220px] flex-col gap-4 overflow-hidden rounded-xl border border-white/10 bg-[#151A21] p-5 transition-all duration-200 hover:border-white/20 hover:shadow-xl hover:shadow-black/30"
          >
            <div className="absolute left-0 right-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${project.color}60, transparent)` }} />

            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: `${project.color}15`, border: `1px solid ${project.color}25` }}>
                  <FolderKanban className="h-4 w-4" style={{ color: project.color }} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">{project.name}</h3>
                  {project.status === "completed" ? <span className="text-[9px] font-medium text-emerald-400">✓ Completed</span> : null}
                </div>
              </div>
            </div>

            <p className="line-clamp-2 text-xs leading-relaxed text-zinc-500">{project.description}</p>

            <div className="grid grid-cols-3 gap-2">
              {[
                { label: copy.total, value: project.bugsTotal, tone: "#F4F4F5" },
                { label: copy.open, value: project.bugsOpen, tone: project.bugsOpen > 10 ? "#F97316" : "#F4F4F5" },
                { label: copy.critical, value: project.bugsCritical, tone: project.bugsCritical > 0 ? "#E41F07" : "#F4F4F5" }
              ].map((item) => (
                <div key={item.label} className="rounded-lg border border-white/5 bg-white/5 p-2 text-center">
                  <p className="text-sm font-bold" style={{ color: item.tone }}>{item.value}</p>
                  <p className="mt-0.5 text-[9px] text-zinc-600">{item.label}</p>
                </div>
              ))}
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-[10px] text-zinc-600">{copy.progress}</span>
                <span className="text-[10px] font-semibold text-[#F4F4F5]">{project.progress}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${project.progress}%`, background: project.progress === 100 ? "#10B981" : `linear-gradient(90deg, ${project.color}80, ${project.color})` }}
                />
              </div>
            </div>

            <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-2">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {project.members.slice(0, 3).map((member, index) => (
                    <div
                      key={`${project.id}-${member}-${index}`}
                      className={`flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#151A21] bg-gradient-to-br ${memberGradient(index)}`}
                      title={member}
                    >
                      <span className="text-[8px] font-bold text-white">{member}</span>
                    </div>
                  ))}
                  {project.members.length > 3 ? (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#151A21] bg-white/10">
                      <span className="text-[8px] text-[#8B9BB4]">+{project.members.length - 3}</span>
                    </div>
                  ) : null}
                </div>
                <div className="flex items-center gap-1 text-zinc-600">
                  <Calendar className="h-3 w-3" />
                  <span className="text-[10px]">{relativeTime(project.lastActive, locale)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link href={`/dashboard/projects/${project.id}`} className="text-[10px] text-zinc-500 transition-colors hover:text-white">
                  {copy.viewDetails}
                </Link>
                <Link href={`/dashboard/history?projectId=${project.id}`} className="text-[10px] text-zinc-500 transition-colors hover:text-white">
                  {copy.history}
                </Link>
                <Link href={`/dashboard/generator?projectId=${project.id}`} className="inline-flex items-center gap-1 text-[10px] text-zinc-500 transition-colors group-hover:text-[#E41F07]">
                  {copy.openLabel} <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        ))}

        <a
          href="#project-form"
          className="group flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-white/10 bg-[#151A21] p-5 transition-all duration-200 hover:border-[#E41F07]/30 hover:bg-[#E41F07]/5"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-dashed border-white/10 transition-colors group-hover:border-[#E41F07]/30">
            <Plus className="h-5 w-5 text-zinc-600 transition-colors group-hover:text-[#E41F07]" />
          </div>
          <p className="text-sm text-zinc-600 transition-colors group-hover:text-zinc-400">{copy.createNewProject}</p>
        </a>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-[#151A21] py-16 text-center text-sm text-zinc-500">{copy.noProjects}</div>
      ) : null}

      <section id="project-form" className="space-y-3 rounded-xl border border-white/10 bg-[#151A21] p-5">
        <h2 className="text-lg font-semibold text-white">{copy.newProject}</h2>
        <p className="text-sm text-zinc-500">
          {locale === "uk"
            ? "Створіть проєкт і прив'яжіть до нього баг-репорти для кращої аналітики."
            : "Create a project and attach bug reports for cleaner reporting and analytics."}
        </p>
        <ProjectForm />
      </section>
    </div>
  );
}

