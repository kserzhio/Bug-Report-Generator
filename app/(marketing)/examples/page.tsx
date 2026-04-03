import Link from "next/link";
import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getComponentExampleSummaryList } from "@/src/domain/services/component-examples-service";

export const metadata: Metadata = {
  title: "Accessibility Bug Examples by Component | Bug Writer",
  description:
    "Browse practical accessibility bug examples for modal, form, table, navigation, tooltip and other UI components.",
  alternates: {
    canonical: "/examples",
    languages: {
      "en-US": "/examples?lang=en",
      "uk-UA": "/examples?lang=uk",
      "x-default": "/examples"
    }
  }
};

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function ComponentExamplesIndexPage() {
  const items = getComponentExampleSummaryList();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: `${capitalize(item.component)} accessibility bug examples`,
      url: `${appUrl}/examples/${item.component}`
    }))
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
      <div className="space-y-3">
        <Badge className="bg-cyan-100 text-cyan-800">Examples Hub</Badge>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Accessibility Bug Examples by Component</h1>
        <p className="max-w-3xl text-slate-600">
          Real-world issue patterns for common UI components. Use these examples to improve coverage and create higher quality bug reports.
        </p>
        <div className="flex flex-wrap items-center gap-4 text-sm font-semibold">
          <Link href="/wcag" className="text-primary">
            Open WCAG hub
          </Link>
          <Link href="/guides" className="text-cyan-700">
            Open guides
          </Link>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Card key={item.component} className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-xl">
                <Link href={`/examples/${item.component}`}>{capitalize(item.component)}</Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-slate-600">{item.issueCount} issue patterns</p>
              <div className="flex flex-wrap gap-2">
                {item.topCriteria.map((criterion) => (
                  <Badge key={`${item.component}-${criterion}`} className="bg-slate-100 text-slate-700">
                    {criterion}
                  </Badge>
                ))}
              </div>
              <div className="pt-1">
                <Link href={`/examples/${item.component}`} className="text-sm font-semibold text-primary">
                  Explore examples
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
