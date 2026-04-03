import Link from "next/link";
import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Accessibility Testing Comparisons for QA Teams | Bug Writer",
  description:
    "Compare accessibility QA approaches: keyboard vs screen reader testing, WCAG 2.1 vs 2.2, and manual vs automated testing workflows.",
  alternates: {
    canonical: "/compare",
    languages: {
      "en-US": "/compare?lang=en",
      "uk-UA": "/compare?lang=uk",
      "x-default": "/compare"
    }
  }
};

const COMPARISONS = [
  {
    title: "WCAG 2.1 vs 2.2 for QA Teams",
    description: "What changed in WCAG 2.2 and how to update testing workflows.",
    href: "/compare/wcag-21-vs-22-for-qa"
  },
  {
    title: "Keyboard Navigation vs Screen Reader Testing",
    description: "Understand what each method validates and where they overlap.",
    href: "/compare/keyboard-vs-screen-reader"
  },
  {
    title: "Manual vs Automated Accessibility Testing",
    description: "Balance tooling speed with expert exploratory checks.",
    href: "/compare/manual-vs-automated-accessibility-testing"
  }
] as const;

export default function CompareHubPage() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: COMPARISONS.map((item, index) => ({
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
        <Badge className="bg-cyan-100 text-cyan-800">Compare</Badge>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Accessibility QA Comparisons</h1>
        <p className="max-w-3xl text-slate-600">
          Practical comparisons to help QA teams choose the right accessibility testing strategy for each release.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {COMPARISONS.map((item) => (
          <Card key={item.href} className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-base">{item.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-600">
              <p>{item.description}</p>
              <Link href={item.href} className="inline-flex rounded-full border border-slate-200 px-4 py-2 font-semibold text-slate-700">
                Open comparison
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
