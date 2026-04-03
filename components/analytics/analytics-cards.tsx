"use client";

import { useLocale } from "@/components/providers/locale-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AnalyticsCards({
  totalBugs,
  libraryItems,
  criticalHighCount,
  complianceScore
}: {
  totalBugs: number;
  libraryItems: number;
  criticalHighCount: number;
  complianceScore: number;
}) {
  const locale = useLocale();

  const cards =
    locale === "uk"
      ? [
          { label: "Всього багів", value: totalBugs },
          { label: "Елементи бібліотеки", value: libraryItems },
          { label: "Critical + High", value: criticalHighCount },
          { label: "Оцінка комплаєнсу", value: `${complianceScore}%` }
        ]
      : [
          { label: "Total bugs", value: totalBugs },
          { label: "Library items", value: libraryItems },
          { label: "Critical + High", value: criticalHighCount },
          { label: "Compliance score", value: `${complianceScore}%` }
        ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label}>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">{card.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-slate-950">{card.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
