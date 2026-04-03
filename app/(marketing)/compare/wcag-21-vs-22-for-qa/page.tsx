import Link from "next/link";
import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "WCAG 2.1 vs 2.2 for QA Teams | Bug Writer",
  description:
    "A practical QA-focused comparison of WCAG 2.1 and 2.2, including new criteria and how to update testing workflows.",
  alternates: {
    canonical: "/compare/wcag-21-vs-22-for-qa",
    languages: {
      "en-US": "/compare/wcag-21-vs-22-for-qa?lang=en",
      "uk-UA": "/compare/wcag-21-vs-22-for-qa?lang=uk",
      "x-default": "/compare/wcag-21-vs-22-for-qa"
    }
  }
};

const NEW_22_CRITERIA = [
  "2.4.11 Focus Not Obscured (Minimum)",
  "2.5.8 Target Size (Minimum)",
  "3.2.6 Consistent Help",
  "3.3.7 Redundant Entry",
  "3.3.8 Accessible Authentication (Minimum)"
];

export default function CompareWcag21Vs22Page() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "WCAG 2.1 vs 2.2 for QA Teams",
    description:
      "What changed in WCAG 2.2 and how QA teams should adapt accessibility testing and bug reporting.",
    mainEntityOfPage: `${appUrl}/compare/wcag-21-vs-22-for-qa`
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <div className="space-y-3">
        <Badge className="bg-cyan-100 text-cyan-800">Comparison</Badge>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">WCAG 2.1 vs 2.2 for QA Teams</h1>
        <p className="max-w-3xl text-slate-600">
          WCAG 2.2 adds criteria that directly affect keyboard focus visibility, target size, authentication, and form effort.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>WCAG 2.1 Baseline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-700">
            <p>- Strong foundation for semantics, keyboard operability, and understandable forms.</p>
            <p>- Often used as minimum compliance target in legacy workflows.</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>WCAG 2.2 Additions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-700">
            {NEW_22_CRITERIA.map((item) => (
              <p key={item}>- {item}</p>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle>QA Workflow Update</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-700">
          <p>1. Update test cases to include focus obstruction and target size checks.</p>
          <p>2. Add criteria-specific tags in bug reports for WCAG 2.2 defects.</p>
          <p>3. Prioritize user-journey regressions where authentication and forms are involved.</p>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <Link href="/wcag" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">
          Open WCAG hub
        </Link>
        <Link href="/checklists/accessibility-release" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">
          Release checklist
        </Link>
      </div>
    </div>
  );
}
