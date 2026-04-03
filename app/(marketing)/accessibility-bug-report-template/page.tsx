import Link from "next/link";
import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Accessibility Bug Report Template | Bug Writer",
  description:
    "Use a practical accessibility bug report template with WCAG mapping, reproduction steps, evidence matrix, and expected behavior.",
  alternates: {
    canonical: "/accessibility-bug-report-template",
    languages: {
      "en-US": "/accessibility-bug-report-template?lang=en",
      "uk-UA": "/accessibility-bug-report-template?lang=uk",
      "x-default": "/accessibility-bug-report-template"
    }
  }
};

const TEMPLATE_SECTIONS = [
  "Title and severity",
  "Affected users and environments",
  "Actual behavior",
  "Expected behavior",
  "WCAG criterion mapping",
  "Reproduction steps",
  "Evidence attachments (screenshots/video)",
  "Browser/OS/device/assistive technology matrix"
];

export default function AccessibilityBugReportTemplatePage() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Accessibility Bug Report Template",
    description:
      "Structured template for accessibility defect reporting with reproducibility and WCAG context.",
    mainEntityOfPage: `${appUrl}/accessibility-bug-report-template`
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <div className="space-y-3">
        <Badge className="bg-cyan-100 text-cyan-800">Template</Badge>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Accessibility Bug Report Template</h1>
        <p className="max-w-3xl text-slate-600">
          Use this structure to create bug reports that are faster to triage, easier to reproduce, and aligned with WCAG criteria.
        </p>
      </div>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle>Template Structure</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {TEMPLATE_SECTIONS.map((item) => (
            <p key={item} className="text-sm text-slate-700">
              - {item}
            </p>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-5 md:grid-cols-2">
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-base">Why this works</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-700">
            The template enforces consistency and reduces ambiguity during engineering handoff.
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-base">Best used with</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-700">
            Combine with quality score and release checklist before exporting tickets.
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Link href="/features/bug-report-quality-score" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">
          Quality score
        </Link>
        <Link href="/checklists/accessibility-release" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">
          Release checklist
        </Link>
        <Link href="/sign-up" className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
          Start free
        </Link>
      </div>
    </div>
  );
}
