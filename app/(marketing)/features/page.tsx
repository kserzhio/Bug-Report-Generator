import Link from "next/link";
import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Accessibility QA Features | Bug Writer",
  description:
    "Discover Bug Writer features for accessibility QA teams, including bug report quality scoring and structured WCAG-aligned reporting.",
  alternates: {
    canonical: "/features",
    languages: {
      "en-US": "/features?lang=en",
      "uk-UA": "/features?lang=uk",
      "x-default": "/features"
    }
  }
};

const FEATURE_PAGES = [
  {
    title: "Bug Report Quality Score",
    description: "Score report quality by reproducibility, evidence depth, and WCAG precision.",
    href: "/features/bug-report-quality-score"
  }
] as const;

export default function FeaturesHubPage() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: FEATURE_PAGES.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.title,
      url: `${appUrl}${item.href}`
    }))
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />

      <div className="space-y-3">
        <Badge className="bg-cyan-100 text-cyan-800">Features</Badge>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Accessibility QA Features</h1>
        <p className="max-w-3xl text-slate-600">
          Product capabilities designed to improve accessibility bug quality and speed up engineering triage.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {FEATURE_PAGES.map((item) => (
          <Card key={item.href} className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-base">{item.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-600">
              <p>{item.description}</p>
              <Link href={item.href} className="inline-flex rounded-full border border-slate-200 px-4 py-2 font-semibold text-slate-700">
                Open feature
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
