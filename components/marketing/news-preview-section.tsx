"use client";

import Link from "next/link";

import { useLocale } from "@/components/providers/locale-provider";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getFeaturedAccessibilityNewsItems,
  type AccessibilityNewsCategory
} from "@/src/domain/services/accessibility-news-service";

function getCategoryLabel(category: AccessibilityNewsCategory, locale: "en" | "uk") {
  if (locale === "uk") {
    if (category === "standards") return "Стандарти";
    if (category === "tooling") return "Інструменти";
    if (category === "guides") return "Гайди";
    return "Кейси";
  }

  if (category === "standards") return "Standards";
  if (category === "tooling") return "Tooling";
  if (category === "guides") return "Guides";
  return "Case studies";
}

export function NewsPreviewSection() {
  const locale = useLocale();
  const c =
    locale === "uk"
      ? {
          label: "Новини",
          title: "Що нового у доступності",
          subtitle: "Коротка добірка практичних матеріалів для QA та accessibility команд.",
          picks: "Editor picks",
          open: "Відкрити матеріал",
          readArticle: "Читати статтю",
          all: "Усі статті",
          minutes: "хв читання"
        }
      : {
          label: "News",
          title: "What is new in accessibility",
          subtitle: "A short practical digest for QA and accessibility teams.",
          picks: "Editor picks",
          open: "Open resource",
          readArticle: "Read article",
          all: "All articles",
          minutes: "min read"
        };

  const items = getFeaturedAccessibilityNewsItems(3);

  return (
    <section className="space-y-8 rounded-3xl border border-cyan-100/80 bg-gradient-to-br from-cyan-50 via-white to-emerald-50 p-6 shadow-sm">
      <div className="max-w-2xl space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-700">{c.label}</p>
        <h2 className="text-3xl font-semibold tracking-tight text-slate-950">{c.title}</h2>
        <p className="text-slate-600">{c.subtitle}</p>
        <Badge className="bg-cyan-100 text-cyan-800">{c.picks}</Badge>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        {items.map((item) => (
          <Card key={item.id} className="border-cyan-100 bg-white/90">
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-slate-100 text-slate-700">{getCategoryLabel(item.category, locale)}</Badge>
                <span className="text-xs text-muted-foreground">
                  {new Date(item.publishedAt).toLocaleDateString(locale === "uk" ? "uk-UA" : "en-US")} • {item.readingMinutes} {c.minutes}
                </span>
              </div>
              <CardTitle className="pt-2">
                {item.detail ? <Link href={`/news/${item.id}`}>{item.title}</Link> : item.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-7 text-slate-600">{item.summary}</p>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{item.source}</span>
                <div className="flex items-center gap-3">
                  {item.detail ? (
                    <Link href={`/news/${item.id}`} className="text-sm font-semibold text-cyan-700">
                      {c.readArticle}
                    </Link>
                  ) : null}
                  {item.url ? (
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-primary">
                      {c.open}
                    </a>
                  ) : null}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div>
        <Link href="/news" className="text-sm font-semibold text-primary">
          {c.all}
        </Link>
      </div>
    </section>
  );
}
