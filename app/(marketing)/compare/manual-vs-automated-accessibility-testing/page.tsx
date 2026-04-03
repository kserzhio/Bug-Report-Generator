import Link from "next/link";
import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Manual vs Automated Accessibility Testing | Bug Writer",
  description:
    "Compare manual and automated accessibility testing approaches and build a balanced QA strategy for release readiness.",
  alternates: {
    canonical: "/compare/manual-vs-automated-accessibility-testing",
    languages: {
      "en-US": "/compare/manual-vs-automated-accessibility-testing?lang=en",
      "uk-UA": "/compare/manual-vs-automated-accessibility-testing?lang=uk",
      "x-default": "/compare/manual-vs-automated-accessibility-testing"
    }
  }
};

export default function CompareManualVsAutomatedPage() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Manual vs Automated Accessibility Testing",
    description:
      "How to combine automated checks and manual QA for robust accessibility defect detection.",
    mainEntityOfPage: `${appUrl}/compare/manual-vs-automated-accessibility-testing`
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <div className="space-y-3">
        <Badge className="bg-cyan-100 text-cyan-800">Comparison</Badge>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Manual vs Automated Accessibility Testing</h1>
        <p className="max-w-3xl text-slate-600">
          Automated tests provide speed; manual testing provides depth. Strong teams combine both.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>Automated Testing Strengths</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-700">
            <p>- Fast regression signal in CI/CD.</p>
            <p>- Scales across pages and components.</p>
            <p>- Good for rule-detectable failures (missing labels, contrast hints, ARIA misuse).</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>Manual Testing Strengths</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-700">
            <p>- Detects real interaction and usability problems.</p>
            <p>- Validates keyboard flow and screen reader announcements.</p>
            <p>- Provides richer context for triage and fix prioritization.</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle>Balanced Strategy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-700">
          <p>1. Run automated checks on every PR and build.</p>
          <p>2. Run manual exploratory accessibility tests for critical flows before release.</p>
          <p>3. Use quality score and checklist gating before export and handoff.</p>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <Link href="/checklists/accessibility-release" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">
          Open release checklist
        </Link>
        <Link href="/features/bug-report-quality-score" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">
          Quality score feature
        </Link>
      </div>
    </div>
  );
}
