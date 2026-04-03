import Link from "next/link";
import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ACCESSIBILITY_NEWS_ITEMS,
  type AccessibilityNewsCategory
} from "@/src/domain/services/accessibility-news-service";

export const metadata: Metadata = {
  title: "Accessibility News and QA Guides | Bug Writer",
  description:
    "Accessibility testing articles for QA teams: keyboard navigation, screen reader behavior, WCAG mapping, and evidence-first bug reporting.",
  alternates: {
    canonical: "/news",
    languages: {
      "en-US": "/news?lang=en",
      "uk-UA": "/news?lang=uk",
      "x-default": "/news"
    }
  }
};

function getCategoryLabel(category: AccessibilityNewsCategory) {
  if (category === "standards") return "Standards";
  if (category === "tooling") return "Tooling";
  if (category === "guides") return "Guides";
  return "Case studies";
}

export default function MarketingNewsPage() {
  const items = [...ACCESSIBILITY_NEWS_ITEMS].sort((left, right) => right.publishedAt.localeCompare(left.publishedAt));
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.slice(0, 12).map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: item.detail ? `${appUrl}/news/${item.id}` : item.url ?? `${appUrl}/news`,
      name: item.title
    }))
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
      <div className="space-y-3">
        <Badge className="bg-cyan-100 text-cyan-800">Accessibility News</Badge>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Accessibility Articles and Practical QA Guides</h1>
        <p className="max-w-3xl text-slate-600">
          Practical content for QA and product teams: keyboard and screen reader testing, WCAG mapping, evidence collection,
          and reporting standards.
        </p>
        <div className="flex flex-wrap items-center gap-4 text-sm font-semibold">
          <Link href="/guides" className="text-primary">
            Open guides
          </Link>
          <Link href="/checklists/accessibility-release" className="text-cyan-700">
            Release checklist
          </Link>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {items.map((item) => (
          <Card key={item.id} className="border-slate-200">
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-slate-100 text-slate-700">{getCategoryLabel(item.category)}</Badge>
                <span className="text-xs text-muted-foreground">
                  {new Date(item.publishedAt).toLocaleDateString("en-US")} • {item.readingMinutes} min read
                </span>
              </div>
              <CardTitle className="pt-2 text-xl">
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
                      Read article
                    </Link>
                  ) : null}
                  {item.url ? (
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-primary">
                      Open source
                    </a>
                  ) : null}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
