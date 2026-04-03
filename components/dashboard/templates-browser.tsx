"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ChevronRight,
  Eye,
  FileText,
  MousePointer,
  Plus,
  Search,
  Shield,
  Star,
  Type,
  Volume2,
  Zap
} from "lucide-react";

import { DeleteTemplateButton } from "@/components/dashboard/delete-template-button";

type TemplateItem = {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: string;
  wcagVersion: string;
  wcagCriterion: string;
  isSystem: boolean;
};

const severityConfig: Record<string, { color: string; bg: string; border: string }> = {
  Critical: { color: "#E41F07", bg: "rgba(228,31,7,0.12)", border: "rgba(228,31,7,0.2)" },
  High: { color: "#F97316", bg: "rgba(249,115,22,0.12)", border: "rgba(249,115,22,0.2)" },
  Medium: { color: "#EAB308", bg: "rgba(234,179,8,0.12)", border: "rgba(234,179,8,0.2)" },
  Low: { color: "#22C55E", bg: "rgba(34,197,94,0.12)", border: "rgba(34,197,94,0.2)" }
};

function normalizeCategory(value: string) {
  return value
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function categoryColor(category: string) {
  const key = category.toLowerCase();

  if (key.includes("screen") || key.includes("reader")) return "#06B6D4";
  if (key.includes("keyboard")) return "#8B5CF6";
  if (key.includes("status")) return "#10B981";
  if (key.includes("dialog") || key.includes("modal")) return "#A855F7";
  if (key.includes("form")) return "#F59E0B";
  if (key.includes("table")) return "#22C55E";
  if (key.includes("navigation")) return "#06B6D4";

  return "#8B5CF6";
}

function iconByCategory(category: string) {
  const key = category.toLowerCase();

  if (key.includes("screen") || key.includes("reader")) return Volume2;
  if (key.includes("keyboard")) return MousePointer;
  if (key.includes("status")) return Zap;
  if (key.includes("form")) return Type;
  if (key.includes("dialog") || key.includes("modal")) return Shield;
  if (key.includes("navigation")) return MousePointer;

  return FileText;
}

export function TemplatesBrowser({
  templates,
  locale
}: {
  templates: TemplateItem[];
  locale: "en" | "uk";
}) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [starred, setStarred] = useState<Set<string>>(new Set());

  const categories = useMemo(() => {
    const dynamic = Array.from(new Set(templates.map((item) => normalizeCategory(item.category)))).sort();
    return ["All", ...dynamic];
  }, [templates]);

  const filtered = useMemo(() => {
    return templates.filter((item) => {
      const normalizedCategory = normalizeCategory(item.category);
      const matchesCategory = activeCategory === "All" || normalizedCategory === activeCategory;
      const haystack = `${item.title} ${item.description} ${item.wcagCriterion}`.toLowerCase();
      const matchesSearch = haystack.includes(search.toLowerCase().trim());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, search, templates]);

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Templates</h1>
        <p className="text-sm text-muted-foreground">
          {locale === "uk"
            ? "Перевірені шаблони для швидкого запуску репортів та кастомізації під команду."
            : "Production-ready templates to speed up report generation and team workflows."}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={locale === "uk" ? "Пошук шаблонів..." : "Search templates..."}
            className="h-9 w-72 rounded-lg border border-white/10 bg-white/5 pl-10 pr-3 text-sm text-white placeholder:text-zinc-500 focus:border-[#E41F07]/40 focus:outline-none focus:ring-2 focus:ring-[#E41F07]/30"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className="h-8 rounded-lg border px-3.5 text-sm transition-all"
              style={
                activeCategory === category
                  ? {
                      background: "rgba(228,31,7,0.12)",
                      color: "#E41F07",
                      borderColor: "rgba(228,31,7,0.25)"
                    }
                  : {
                      background: "rgba(255,255,255,0.04)",
                      color: "#A1A1AA",
                      borderColor: "rgba(255,255,255,0.08)"
                    }
              }
            >
              {category}
            </button>
          ))}
        </div>

        <a
          href="#template-form"
          className="inline-flex h-9 items-center gap-2 rounded-lg px-4 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-[#E41F07]/20"
          style={{ background: "linear-gradient(135deg, #E41F07, #B91804)" }}
        >
          <Plus className="h-4 w-4" />
          {locale === "uk" ? "Новий шаблон" : "New Template"}
        </a>
      </div>

      <p className="text-xs text-zinc-500">
        {filtered.length} {locale === "uk" ? "шаблон(ів) знайдено" : `template${filtered.length === 1 ? "" : "s"} found`}
      </p>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {filtered.map((item) => {
          const Icon = iconByCategory(item.category);
          const catColor = categoryColor(item.category);
          const severity = severityConfig[item.severity] ?? severityConfig.Medium;
          const isStarred = starred.has(item.id);
          const wcagLabel = item.wcagCriterion.trim() ? `WCAG ${item.wcagVersion} • ${item.wcagCriterion}` : "";

          return (
            <div
              key={item.id}
              className="group flex flex-col gap-4 rounded-xl border border-white/10 bg-[#151A21] p-5 transition-all duration-200 hover:border-white/20 hover:shadow-xl hover:shadow-black/30"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                    style={{ background: `${catColor}15`, border: `1px solid ${catColor}25` }}
                  >
                    <Icon className="h-4 w-4" style={{ color: catColor }} />
                  </div>
                  <span className="rounded px-2 py-0.5 text-[10px] font-medium" style={{ background: `${catColor}15`, color: catColor }}>
                    {normalizeCategory(item.category)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setStarred((prev) => {
                      const next = new Set(prev);
                      if (next.has(item.id)) {
                        next.delete(item.id);
                      } else {
                        next.add(item.id);
                      }
                      return next;
                    });
                  }}
                  aria-label={locale === "uk" ? "Перемкнути обране" : "Toggle favorite"}
                >
                  <Star
                    className="h-4 w-4"
                    style={{ fill: isStarred ? "#F59E0B" : "none", color: isStarred ? "#F59E0B" : "#3F3F46" }}
                  />
                </button>
              </div>

              <div>
                <h3 className="mb-1.5 text-sm font-semibold text-white">{item.title}</h3>
                <p className="line-clamp-2 text-xs leading-relaxed text-zinc-500">{item.description}</p>
              </div>

              {wcagLabel ? (
                <div className="flex items-center gap-2">
                  <Eye className="h-3 w-3 text-[#8B5CF6]" />
                  <span className="text-xs text-zinc-400">{wcagLabel}</span>
                </div>
              ) : null}

              <div className="mt-auto space-y-3 border-t border-white/5 pt-2">
                <div className="flex items-center justify-between">
                  <span
                    className="rounded px-2 py-0.5 text-[10px] font-semibold"
                    style={{ background: severity.bg, color: severity.color, border: `1px solid ${severity.border}` }}
                  >
                    {item.severity}
                  </span>
                  <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-zinc-400">
                    {item.isSystem ? (locale === "uk" ? "Системний" : "System") : (locale === "uk" ? "Кастомний" : "Custom")}
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Link href={`/dashboard/generator?templateId=${item.id}`} className="inline-flex items-center gap-1 text-xs text-zinc-400 transition-colors hover:text-[#E41F07]">
                    {locale === "uk" ? "Використати" : "Use"}
                    <ChevronRight className="h-3 w-3" />
                  </Link>
                  <div className="flex flex-wrap gap-2">
                    {!item.isSystem ? (
                      <Link href={`/dashboard/templates?edit=${item.id}`} className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-300 transition hover:border-white/20 hover:text-white">
                        {locale === "uk" ? "Редагувати" : "Edit"}
                      </Link>
                    ) : null}
                    {!item.isSystem ? <DeleteTemplateButton templateId={item.id} /> : null}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
