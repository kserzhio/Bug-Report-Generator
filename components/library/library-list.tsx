"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { BookMarked, CheckCircle2, ChevronDown, Copy, Eye, FileText, MousePointer, Shield, Tag, Trash2, Type, Volume2, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/providers/locale-provider";
import { notifyError, notifySuccess } from "@/lib/ui/toast-policy";
import { bulkDeleteLibraryItemsAction, deleteReusableBugAction } from "@/src/server/actions/dashboard-actions";

function parseEvidenceUrls(value: string | null | undefined) {
  return (value ?? "")
    .split(/\n|,|\s+/g)
    .map((part) => part.trim())
    .filter((part) => /^https?:\/\//i.test(part) || part.startsWith("/"));
}

function categoryIcon(category: string) {
  const value = category.toLowerCase();
  if (value.includes("access")) return Shield;
  if (value.includes("ui")) return Eye;
  if (value.includes("perform")) return Zap;
  if (value.includes("functional")) return FileText;
  return BookMarked;
}

const severityConfig: Record<string, { color: string; bg: string; border: string }> = {
  Critical: { color: "#E41F07", bg: "rgba(228,31,7,0.12)", border: "rgba(228,31,7,0.2)" },
  High: { color: "#F97316", bg: "rgba(249,115,22,0.12)", border: "rgba(249,115,22,0.2)" },
  Medium: { color: "#EAB308", bg: "rgba(234,179,8,0.12)", border: "rgba(234,179,8,0.2)" },
  Low: { color: "#22C55E", bg: "rgba(34,197,94,0.12)", border: "rgba(34,197,94,0.2)" }
};

function buildMarkdown(item: {
  title: string;
  severity: string;
  wcagVersion: string;
  wcagCriterion: string;
  actualBehavior: string;
  expectedBehavior: string;
}) {
  return `## ${item.title}\n\n**Severity:** ${item.severity}\n**WCAG:** ${item.wcagVersion} - ${item.wcagCriterion}\n\n### Actual Behavior\n${item.actualBehavior}\n\n### Expected Behavior\n${item.expectedBehavior}`;
}

export function LibraryList({
  items
}: {
  items: Array<{
    id: string;
    title: string;
    category: string;
    severity: string;
    wcagVersion: string;
    tags: string[];
    wcagCriterion: string;
    component: string;
    updatedAt: string;
    videoUrl: string | null;
    screenshotUrls: string | null;
    actualBehavior: string;
    expectedBehavior: string;
    usageCount: number;
  }>;
}) {
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const locale = useLocale();

  const allSelected = items.length > 0 && selectedIds.length === items.length;

  function toggleAll() {
    setSelectedIds((prev) => (prev.length === items.length ? [] : items.map((item) => item.id)));
  }

  function toggleOne(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]));
  }

  function copyMarkdown(id: string, markdown: string) {
    navigator.clipboard.writeText(markdown);
    setCopiedId(id);
    window.setTimeout(() => setCopiedId(null), 1600);
  }

  function deleteSingle(itemId: string) {
    setDeletingId(itemId);
    startTransition(async () => {
      const result = await deleteReusableBugAction(itemId);
      setDeletingId(null);

      if (result.error) {
        notifyError(result.error);
        return;
      }

      notifySuccess(result.success ?? (locale === "uk" ? "Елемент видалено." : "Item deleted."));
      window.location.reload();
    });
  }

  function deleteSelected() {
    startTransition(async () => {
      const result = await bulkDeleteLibraryItemsAction(selectedIds);

      if (result.error) {
        notifyError(result.error);
        return;
      }

      notifySuccess(result.success ?? (locale === "uk" ? "Вибрані елементи видалено." : "Selected items deleted."));
      setSelectedIds([]);
      window.location.reload();
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#151A21] p-4">
        <label className="flex items-center gap-2 text-sm font-medium text-slate-200">
          <input type="checkbox" checked={allSelected} onChange={toggleAll} />
          {locale === "uk" ? "Вибрати всі" : "Select all"} ({items.length})
        </label>
        <div className="flex items-center gap-3">
          <p className="text-sm text-slate-400">
            {locale === "uk" ? "Вибрано" : "Selected"}: {selectedIds.length}
          </p>
          <Button variant="outline" size="sm" disabled={isPending || selectedIds.length === 0} onClick={deleteSelected}>
            {isPending ? (locale === "uk" ? "Видалення..." : "Deleting...") : locale === "uk" ? "Видалити вибрані" : "Delete selected"}
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {items.map((item) => {
          const sev = severityConfig[item.severity] ?? severityConfig.Medium;
          const Icon = categoryIcon(item.category);
          const isExpanded = expandedId === item.id;
          const isCopied = copiedId === item.id;
          const evidenceLinks = parseEvidenceUrls(item.screenshotUrls);

          return (
            <div
              key={item.id}
              className="overflow-hidden rounded-xl border border-white/10 bg-[#151A21] transition-all duration-200 hover:border-white/20"
              style={isExpanded ? { boxShadow: "0 0 0 1px rgba(228,31,7,0.15), 0 8px 24px rgba(0,0,0,0.3)" } : undefined}
            >
              <div className="group flex cursor-pointer items-center gap-4 px-5 py-4" onClick={() => setExpandedId(isExpanded ? null : item.id)}>
                <input
                  type="checkbox"
                  checked={selectedIds.includes(item.id)}
                  onClick={(event) => event.stopPropagation()}
                  onChange={() => toggleOne(item.id)}
                />

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ background: `${sev.color}12`, border: `1px solid ${sev.color}20` }}>
                  <Icon className="h-4 w-4" style={{ color: sev.color }} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className="truncate text-sm font-semibold text-white">{item.title}</span>
                    <span className="rounded px-1.5 py-0.5 text-[10px] font-semibold" style={{ background: sev.bg, color: sev.color, border: `1px solid ${sev.border}` }}>
                      {item.severity}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <span className="flex items-center gap-1 text-[10px] text-zinc-500">
                      <MousePointer className="h-3 w-3 text-[#8B5CF6]" />
                      {item.wcagVersion} {item.wcagCriterion}
                    </span>
                    <div className="flex flex-wrap items-center gap-1">
                      {item.tags.slice(0, 4).map((tag) => (
                        <span key={`${item.id}-${tag}`} className="inline-flex items-center gap-1 rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[9px] text-zinc-500">
                          <Tag className="h-2 w-2" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="hidden items-center gap-4 text-xs text-zinc-600 lg:flex">
                  <span>{item.usageCount} uses</span>
                  <span>{item.updatedAt}</span>
                </div>

                <div className="flex items-center gap-1" onClick={(event) => event.stopPropagation()}>
                  <button
                    onClick={() => copyMarkdown(item.id, buildMarkdown(item))}
                    className="flex h-8 w-8 items-center justify-center rounded-md transition-all hover:bg-white/10"
                    title="Copy markdown"
                  >
                    {isCopied ? <CheckCircle2 className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4 text-zinc-500" />}
                  </button>
                  <button
                    onClick={() => deleteSingle(item.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-md transition-all hover:bg-red-500/10"
                    title="Delete"
                    disabled={isPending && deletingId === item.id}
                  >
                    <Trash2 className="h-4 w-4 text-zinc-600 transition-colors hover:text-red-400" />
                  </button>
                </div>

                <ChevronDown className="h-4 w-4 text-zinc-600 transition-transform duration-200" style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }} />
              </div>

              {isExpanded ? (
                <div className="space-y-4 border-t border-white/5 px-5 pb-5 pt-4">
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <div>
                      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Actual Behavior</p>
                      <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm leading-relaxed text-white">{item.actualBehavior}</div>
                    </div>
                    <div>
                      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Expected Behavior</p>
                      <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-4 text-sm leading-relaxed text-white">{item.expectedBehavior}</div>
                    </div>
                  </div>

                  {item.videoUrl || evidenceLinks.length > 0 ? (
                    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                      <p className="mb-2 text-[10px] uppercase tracking-wider text-zinc-500">Evidence</p>
                      <div className="flex flex-wrap gap-2">
                        {item.videoUrl ? (
                          <a href={item.videoUrl} target="_blank" rel="noreferrer" className="rounded-full border border-emerald-300/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                            Video
                          </a>
                        ) : null}
                        {evidenceLinks.map((url) => (
                          <a key={url} href={url} target="_blank" rel="noreferrer" className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                            Screenshot
                          </a>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => copyMarkdown(item.id, buildMarkdown(item))}
                      className="inline-flex h-8 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 text-xs text-white"
                    >
                      {isCopied ? <CheckCircle2 className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                      {isCopied ? "Copied!" : "Copy Markdown"}
                    </button>

                    <Link
                      href={`/dashboard/generator?libraryId=${item.id}`}
                      className="inline-flex h-8 items-center gap-2 rounded-lg px-4 text-xs font-semibold text-white"
                      style={{ background: "linear-gradient(135deg, #E41F07, #B91804)" }}
                    >
                      Use in Generator
                    </Link>
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
