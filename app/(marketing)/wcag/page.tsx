import Link from "next/link";
import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getWcagCriteriaSummaries } from "@/src/domain/services/wcag-content-service";

export const metadata: Metadata = {
  title: "WCAG Criteria Examples for Accessibility QA | Bug Writer",
  description:
    "Browse WCAG criteria with practical QA examples, affected components, and reusable reporting patterns.",
  alternates: {
    canonical: "/wcag",
    languages: {
      "en-US": "/wcag?lang=en",
      "uk-UA": "/wcag?lang=uk",
      "x-default": "/wcag"
    }
  }
};

export default function WcagIndexPage() {
  const criteria = getWcagCriteriaSummaries();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: criteria.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: `${item.code} ${item.title}`,
      url: `${appUrl}/wcag/${item.code}`
    }))
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
      <div className="space-y-3">
        <Badge className="bg-cyan-100 text-cyan-800">WCAG Hub</Badge>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">WCAG Criteria with Practical QA Examples</h1>
        <p className="max-w-3xl text-slate-600">
          Navigate by criterion and review concrete bug patterns linked to components, severity, and reproducibility context.
        </p>
        <div className="flex flex-wrap items-center gap-4 text-sm font-semibold">
          <Link href="/examples" className="text-primary">
            Browse examples
          </Link>
          <Link href="/checklists/accessibility-release" className="text-cyan-700">
            Release checklist
          </Link>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {criteria.map((item) => (
          <Card key={item.code} className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-xl">
                <Link href={`/wcag/${item.code}`}>{item.code}</Link>
              </CardTitle>
              <p className="text-sm text-slate-600">{item.title}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-slate-600">{item.mentionCount} mapped examples</p>
              <div className="flex flex-wrap gap-2">
                {item.components.slice(0, 4).map((component) => (
                  <Link
                    key={`${item.code}-${component}`}
                    href={`/examples/${component}`}
                    className="rounded-full border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-700"
                  >
                    {component}
                  </Link>
                ))}
              </div>
              <div className="pt-1">
                <Link href={`/wcag/${item.code}`} className="text-sm font-semibold text-primary">
                  Open criterion page
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
