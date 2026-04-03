import Link from "next/link";
import { BookMarked, BookOpen, Sparkles, Plus } from "lucide-react";

import { SavedViewsBar } from "@/components/dashboard/saved-views-bar";
import { LibraryList } from "@/components/library/library-list";
import { getMessages } from "@/lib/i18n/messages";
import { normalizeLocale } from "@/lib/i18n/locale";
import { prisma } from "@/lib/prisma/client";
import { getCurrentWorkspaceContext } from "@/src/server/queries/workspace";

function buildQuery(base: { q: string; severity: string; tag: string; category: string }, patch: Partial<{ q: string; severity: string; tag: string; category: string }>) {
  const next = { ...base, ...patch };
  const params = new URLSearchParams();
  if (next.q) params.set("q", next.q);
  if (next.severity) params.set("severity", next.severity);
  if (next.tag) params.set("tag", next.tag);
  if (next.category) params.set("category", next.category);
  const query = params.toString();
  return query ? `/dashboard/library?${query}` : "/dashboard/library";
}

export default async function LibraryPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; severity?: string; tag?: string; category?: string }>;
}) {
  const context = await getCurrentWorkspaceContext();
  const locale = normalizeLocale(context.workspace.uiLocale);
  const t = getMessages(locale);
  const params = await searchParams;

  const copy =
    locale === "uk"
      ? {
          searchPlaceholder: "Пошук по назві або тегу...",
          addSnippet: "Додати сніпет",
          snippetsInLibrary: "сніпетів у бібліотеці",
          all: "All",
          categories: "Категорії",
          savedSnippets: "Збережені сніпети",
          totalUses: "Всього використань",
          noItems: "Немає сніпетів за цими фільтрами.",
          allSeverities: "Усі рівні",
          apply: "Застосувати"
        }
      : {
          searchPlaceholder: "Search by title or tag...",
          addSnippet: "Add Snippet",
          snippetsInLibrary: "snippets in library",
          all: "All",
          categories: "Categories",
          savedSnippets: "Saved Snippets",
          totalUses: "Total Uses",
          noItems: "No snippets found for current filters.",
          allSeverities: "All severities",
          apply: "Apply"
        };

  const q = params.q?.trim() ?? "";
  const severity = params.severity?.trim() ?? "";
  const tag = params.tag?.trim() ?? "";
  const category = params.category?.trim() ?? "";

  const [items, savedViews, usageGroups] = await Promise.all([
    prisma.reusableBug.findMany({
      where: {
        workspaceId: context.workspace.id,
        ...(severity ? { severity } : {}),
        ...(tag ? { tags: { has: tag } } : {}),
        ...(category && category !== "All" ? { category: { equals: category, mode: "insensitive" } } : {}),
        ...(q
          ? {
              OR: [
                { title: { contains: q, mode: "insensitive" } },
                { category: { contains: q, mode: "insensitive" } },
                { component: { contains: q, mode: "insensitive" } },
                { wcagCriterion: { contains: q, mode: "insensitive" } },
                { tags: { has: q } }
              ]
            }
          : {})
      },
      orderBy: { updatedAt: "desc" }
    }),
    prisma.savedView.findMany({
      where: {
        workspaceId: context.workspace.id,
        scope: "LIBRARY",
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
    }),
    prisma.generatedBug.groupBy({
      by: ["title"],
      where: { workspaceId: context.workspace.id },
      _count: { _all: true }
    })
  ]);

  const usageByTitle = new Map(usageGroups.map((group) => [group.title.trim().toLowerCase(), group._count._all]));

  const allCategories = [
    "All",
    ...Array.from(new Set(items.map((item) => item.category).filter(Boolean))).sort((a, b) => a.localeCompare(b))
  ];

  const totalUses = items.reduce((sum, item) => sum + (usageByTitle.get(item.title.trim().toLowerCase()) ?? 0), 0);

  const severityOptions = [
    { label: copy.allSeverities, value: "" },
    { label: "Critical", value: "Critical" },
    { label: "High", value: "High" },
    { label: "Medium", value: "Medium" },
    { label: "Low", value: "Low" }
  ];

  const currentQueryString = new URLSearchParams(
    Object.entries({ q, severity, tag, category }).filter(([, value]) => Boolean(value)) as Array<[string, string]>
  ).toString();

  const filters = { q, severity, tag, category };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-white">{t.dashboard.libraryTitle}</h1>
        <p className="text-sm text-zinc-400">{t.dashboard.librarySubtitle}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          { label: copy.savedSnippets, value: items.length, icon: BookMarked, color: "#8B5CF6" },
          { label: copy.totalUses, value: totalUses, icon: Sparkles, color: "#06B6D4" },
          { label: copy.categories, value: Math.max(0, allCategories.length - 1), icon: BookOpen, color: "#10B981" }
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
            className="h-9 w-64 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white placeholder:text-zinc-500 focus:border-[#E41F07]/40 focus:outline-none focus:ring-2 focus:ring-[#E41F07]/30"
          />
          <select
            name="severity"
            defaultValue={severity}
            className="h-9 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-zinc-300 focus:border-[#E41F07]/40 focus:outline-none focus:ring-2 focus:ring-[#E41F07]/30"
          >
            {severityOptions.map((option) => (
              <option key={option.value || "all"} value={option.value} className="bg-[#151A21] text-zinc-200">
                {option.label}
              </option>
            ))}
          </select>
          <input type="hidden" name="category" value={category} />
          <button className="h-9 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground">{copy.apply}</button>
        </form>

        <Link
          href="/dashboard/generator"
          className="inline-flex h-9 items-center gap-2 rounded-lg px-4 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-[#E41F07]/20"
          style={{ background: "linear-gradient(135deg, #E41F07, #B91804)" }}
        >
          <Plus className="h-4 w-4" />
          {copy.addSnippet}
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {allCategories.map((cat) => {
          const isActive = (category || "All") === cat;
          return (
            <Link
              key={cat}
              href={buildQuery(filters, { category: cat === "All" ? "" : cat })}
              className="h-8 rounded-lg border px-3.5 text-xs transition-all"
              style={
                isActive
                  ? { background: "rgba(228,31,7,0.12)", color: "#E41F07", borderColor: "rgba(228,31,7,0.25)" }
                  : { background: "rgba(255,255,255,0.04)", color: "#71717A", borderColor: "rgba(255,255,255,0.07)" }
              }
            >
              <span className="inline-flex h-full items-center">{cat}</span>
            </Link>
          );
        })}
      </div>

      <p className="text-xs text-zinc-500">
        {items.length} {copy.snippetsInLibrary}
      </p>

      <SavedViewsBar
        scope="LIBRARY"
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

      {items.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-[#151A21] py-16 text-center text-sm text-zinc-500">{copy.noItems}</div>
      ) : (
        <LibraryList
          items={items.map((item) => ({
            id: item.id,
            title: item.title,
            category: item.category,
            severity: item.severity,
            wcagVersion: item.wcagVersion,
            tags: item.tags,
            wcagCriterion: item.wcagCriterion,
            component: item.component,
            videoUrl: item.videoUrl,
            screenshotUrls: item.screenshotUrls,
            actualBehavior: item.actualBehavior,
            expectedBehavior: item.expectedBehavior,
            usageCount: usageByTitle.get(item.title.trim().toLowerCase()) ?? 0,
            updatedAt: new Date(item.updatedAt).toLocaleString(locale === "uk" ? "uk-UA" : "en-US")
          }))}
        />
      )}
    </div>
  );
}
