"use client";

import { useLocale } from "@/components/providers/locale-provider";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GeneratedInsight } from "@/src/domain/services/bug-insights-service";

function formatConfidence(score: number, locale: "en" | "uk") {
  return locale === "uk" ? `${Math.round(score * 100)}% впевненість` : `${Math.round(score * 100)}% confidence`;
}

export function InsightsPanel({
  insight,
  onApplyWcag,
  providerLabel,
  mode
}: {
  insight: GeneratedInsight;
  onApplyWcag: () => void;
  providerLabel?: string | null;
  mode: "rule" | "ai" | "hybrid";
}) {
  const locale = useLocale();

  return (
    <Card>
      <CardHeader className="border-b border-slate-100">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>{locale === "uk" ? "Підказки виправлення та WCAG mapping" : "Fix suggestions and WCAG mapping"}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {providerLabel
                ? locale === "uk"
                  ? `Режим: ${mode}. Підсилено через ${providerLabel}.`
                  : `Assist mode: ${mode}. Enhanced with ${providerLabel}.`
                : mode === "rule"
                  ? locale === "uk"
                    ? "Режим: rule-based. Швидкі детерміновані поради на основі компонента, поведінки та нотаток."
                    : "Assist mode: rule-based. Fast deterministic guidance based on the component, behavior, and notes."
                  : locale === "uk"
                    ? `Режим: ${mode}. Запустіть AI assist для збагачення чернетки.`
                    : `Assist mode: ${mode}. Run AI assist to enrich the current draft.`}
            </p>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <Badge>WCAG {insight.suggestedLevel}</Badge>
            <Badge className="bg-slate-100 text-slate-700">{formatConfidence(insight.confidenceScore, locale)}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-6 text-sm text-slate-700">
        <div className="space-y-1">
          <p className="font-semibold text-slate-950">{locale === "uk" ? "Рекомендований WCAG" : "Suggested WCAG"}</p>
          <p>{insight.suggestedWcag}</p>
          <button type="button" className="text-sm font-semibold text-primary" onClick={onApplyWcag}>
            {locale === "uk" ? "Застосувати WCAG mapping" : "Apply suggested WCAG mapping"}
          </button>
        </div>
        <div className="space-y-1">
          <p className="font-semibold text-slate-950">{locale === "uk" ? "Проблема" : "Problem"}</p>
          <p>{insight.problem}</p>
        </div>
        <div className="space-y-1">
          <p className="font-semibold text-slate-950">{locale === "uk" ? "Чому це важливо" : "Why it matters"}</p>
          <p>{insight.whyItMatters}</p>
        </div>
        <div className="space-y-1">
          <p className="font-semibold text-slate-950">{locale === "uk" ? "Як виправити" : "How to fix"}</p>
          <ul className="space-y-1 text-slate-700">
            {insight.howToFix.map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
        </div>
        <div className="space-y-1">
          <p className="font-semibold text-slate-950">{locale === "uk" ? "Приклад коду" : "Code example"}</p>
          <pre className="overflow-auto rounded-2xl bg-slate-950 p-4 text-xs leading-6 text-slate-100">
            {insight.codeExample}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
}
