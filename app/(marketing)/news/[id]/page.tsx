import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NewsCommentsSection } from "@/components/marketing/news-comments-section";
import {
  ACCESSIBILITY_NEWS_ITEMS,
  getAccessibilityNewsItemById,
  type AccessibilityNewsCategory
} from "@/src/domain/services/accessibility-news-service";

function getCategoryLabel(category: AccessibilityNewsCategory) {
  if (category === "standards") return "Standards";
  if (category === "tooling") return "Tooling";
  if (category === "guides") return "Guides";
  return "Case studies";
}

export function generateStaticParams() {
  return ACCESSIBILITY_NEWS_ITEMS.filter((item) => item.detail).map((item) => ({ id: item.id }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const item = getAccessibilityNewsItemById(id);

  if (!item || !item.detail) {
    return {
      title: "Article not found | Bug Writer"
    };
  }

  return {
    title: `${item.title} | Bug Writer`,
    description: item.summary,
    alternates: {
      canonical: `/news/${item.id}`,
      languages: {
        "en-US": `/news/${item.id}?lang=en`,
        "uk-UA": `/news/${item.id}?lang=uk`,
        "x-default": `/news/${item.id}`
      }
    },
    openGraph: {
      title: item.title,
      description: item.summary,
      type: "article",
      publishedTime: item.publishedAt
    }
  };
}

export default async function MarketingNewsDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = getAccessibilityNewsItemById(id);

  if (!item || !item.detail) {
    notFound();
  }
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: item.title,
    description: item.summary,
    datePublished: item.publishedAt,
    author: {
      "@type": "Organization",
      name: item.source
    },
    mainEntityOfPage: `${appUrl}/news/${item.id}`
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: appUrl
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "News",
        item: `${appUrl}/news`
      },
      {
        "@type": "ListItem",
        position: 3,
        name: item.title,
        item: `${appUrl}/news/${item.id}`
      }
    ]
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-primary/40 hover:text-slate-950"
          >
            Back to home
          </Link>
          <Link
            href="/news"
            className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-primary/40 hover:text-slate-950"
          >
            Back to all articles
          </Link>
        </div>
        {item.url ? (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-cyan-200 px-3 py-1.5 text-xs font-semibold text-cyan-800 transition hover:border-cyan-300 hover:text-cyan-950"
          >
            Open source
          </a>
        ) : null}
      </div>

      <Card className="overflow-hidden border-slate-200">
        <div className="h-1 w-full bg-gradient-to-r from-cyan-500 via-emerald-500 to-sky-500" />
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-slate-100 text-slate-700">{getCategoryLabel(item.category)}</Badge>
            <span className="text-xs text-muted-foreground">
              {new Date(item.publishedAt).toLocaleDateString("en-US")} • {item.readingMinutes} min read
            </span>
          </div>
          <CardTitle className="text-2xl">{item.title}</CardTitle>
          <p className="text-sm text-slate-600">{item.summary}</p>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-7 text-slate-700">{item.detail.intro}</p>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {item.detail.sections.map((section) => (
          <Card key={section.title} className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-base">{section.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {section.points.map((point) => (
                <p key={point} className="text-sm text-slate-700">
                  - {point}
                </p>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {item.wcagCodes && item.wcagCodes.length > 0 ? (
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-base">Related WCAG pages</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {item.wcagCodes.map((code) => (
              <Link
                key={`${item.id}-${code}`}
                href={`/wcag/${code}`}
                className="rounded-full border border-cyan-200 px-3 py-1.5 text-xs font-semibold text-cyan-700"
              >
                {code}
              </Link>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <NewsCommentsSection postId={item.id} />
    </div>
  );
}
