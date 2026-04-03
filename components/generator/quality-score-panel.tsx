"use client";

import { useMemo } from "react";

import { useLocale } from "@/components/providers/locale-provider";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  calculateBugReportQualityScore,
  type BugReportQualityScore,
  type QualityCheckId
} from "@/src/domain/services/quality-score-service";
import type { GeneratorFormValues } from "@/src/validation/generator";

function getCheckLabel(id: QualityCheckId, locale: "en" | "uk") {
  const labelsUk: Record<QualityCheckId, string> = {
    reproduction_steps: "Кроки відтворення",
    environment_matrix: "Browser / OS / Device matrix",
    assistive_technology: "Assistive technology",
    evidence_assets: "Скріншоти або відео",
    wcag_mapping: "WCAG mapping",
    behavior_clarity: "Actual vs expected clarity",
    affected_users: "Опис affected users",
    tools_coverage: "Tools used",
    notes_context: "Нотатки/контекст"
  };

  const labelsEn: Record<QualityCheckId, string> = {
    reproduction_steps: "Reproduction steps",
    environment_matrix: "Browser / OS / Device matrix",
    assistive_technology: "Assistive technology",
    evidence_assets: "Screenshots or video",
    wcag_mapping: "WCAG mapping",
    behavior_clarity: "Actual vs expected clarity",
    affected_users: "Affected users detail",
    tools_coverage: "Tools used",
    notes_context: "Notes/context"
  };

  return locale === "uk" ? labelsUk[id] : labelsEn[id];
}

function getTopRecommendations(score: BugReportQualityScore, locale: "en" | "uk") {
  const failed = score.checks.filter((item) => !item.passed).sort((a, b) => b.weight - a.weight);
  const top = failed.slice(0, 3);

  return top.map((item) => {
    if (locale === "uk") {
      if (item.id === "reproduction_steps") return "Додайте чіткі кроки відтворення (мінімум 2-3).";
      if (item.id === "environment_matrix") return "Заповніть browser, OS і device для точного відтворення.";
      if (item.id === "assistive_technology") return "Додайте screen reader або іншу AT, якщо релевантно.";
      if (item.id === "evidence_assets") return "Додайте скріншоти або відео з дефектом.";
      if (item.id === "wcag_mapping") return "Уточніть конкретний WCAG критерій.";
      if (item.id === "behavior_clarity") return "Розширте actual/expected так, щоб різниця була очевидна.";
      if (item.id === "affected_users") return "Уточніть групи користувачів, яких зачіпає проблема.";
      if (item.id === "tools_coverage") return "Додайте інструменти тестування (наприклад NVDA, Axe).";
      return "Додайте контекст у notes (коли/де/наскільки часто).";
    }

    if (item.id === "reproduction_steps") return "Add clear reproduction steps (at least 2-3).";
    if (item.id === "environment_matrix") return "Fill browser, OS, and device for deterministic reproduction.";
    if (item.id === "assistive_technology") return "Include screen reader or relevant assistive tech details.";
    if (item.id === "evidence_assets") return "Attach screenshots or a short video clip.";
    if (item.id === "wcag_mapping") return "Map the issue to a specific WCAG criterion.";
    if (item.id === "behavior_clarity") return "Make actual vs expected behavior clearly distinct.";
    if (item.id === "affected_users") return "Describe affected users in more concrete terms.";
    if (item.id === "tools_coverage") return "List test tools used (for example NVDA, Axe).";
    return "Add operational context in notes (where/when/frequency).";
  });
}

export function QualityScorePanel({ values }: { values: GeneratorFormValues }) {
  const locale = useLocale();
  const score = useMemo(() => calculateBugReportQualityScore(values), [values]);
  const recommendations = useMemo(() => getTopRecommendations(score, locale), [locale, score]);

  const c =
    locale === "uk"
      ? {
          title: "Bug Report Quality Score",
          subtitle: "Оцінка повноти evidence та відтворюваності баг-репорту.",
          ready: "Готово до експорту",
          improve: "Потрібно покращити",
          recommendations: "Що покращити в першу чергу"
        }
      : {
          title: "Bug Report Quality Score",
          subtitle: "Completeness score for evidence and reproducibility.",
          ready: "Ready for export",
          improve: "Needs improvement",
          recommendations: "Top improvements to make next"
        };

  return (
    <Card className="border-slate-200">
      <CardHeader className="border-b border-slate-100">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle>{c.title}</CardTitle>
            <p className="text-sm text-muted-foreground">{c.subtitle}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge>{score.grade}</Badge>
            <Badge className={score.score >= 80 ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}>
              {score.score}%
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        <div className="h-2 rounded-full bg-slate-100">
          <div
            className={`h-2 rounded-full transition-all ${score.score >= 80 ? "bg-emerald-500" : score.score >= 60 ? "bg-amber-500" : "bg-rose-500"}`}
            style={{ width: `${score.score}%` }}
          />
        </div>
        <p className="text-sm text-slate-700">
          {score.score >= 80 ? c.ready : c.improve} ({score.passedWeight}/{score.totalWeight})
        </p>
        <div className="flex flex-wrap gap-2">
          {score.checks.map((item) => (
            <Badge
              key={item.id}
              className={item.passed ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}
            >
              {getCheckLabel(item.id, locale)}
            </Badge>
          ))}
        </div>
        {recommendations.length > 0 ? (
          <div className="space-y-1">
            <p className="text-sm font-semibold text-slate-950">{c.recommendations}</p>
            {recommendations.map((item) => (
              <p key={item} className="text-sm text-slate-700">
                - {item}
              </p>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
