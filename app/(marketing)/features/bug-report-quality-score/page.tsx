import Link from "next/link";
import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Bug Report Quality Score for Accessibility QA | Bug Writer",
  description:
    "Measure bug report quality with an evidence-first score: reproduction steps, environment matrix, assistive tech coverage, and WCAG mapping.",
  alternates: {
    canonical: "/features/bug-report-quality-score",
    languages: {
      "en-US": "/features/bug-report-quality-score?lang=en",
      "uk-UA": "/features/bug-report-quality-score?lang=uk",
      "x-default": "/features/bug-report-quality-score"
    }
  }
};

export default function BugReportQualityScoreFeaturePage() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is Bug Report Quality Score?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "It is a completeness score for accessibility bug reports based on evidence quality, reproduction clarity, environment data, assistive technology context, and WCAG mapping."
        }
      },
      {
        "@type": "Question",
        name: "How does it improve accessibility QA workflow?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "It highlights missing details before export, reducing back-and-forth in triage and increasing reproducibility for engineering teams."
        }
      }
    ]
  };

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Bug Writer",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    featureList: [
      "Bug report quality scoring",
      "WCAG mapping support",
      "Evidence checklist for reproducibility"
    ],
    url: `${appUrl}/features/bug-report-quality-score`
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />

      <div className="space-y-3">
        <Badge className="bg-cyan-100 text-cyan-800">Feature</Badge>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Bug Report Quality Score</h1>
        <p className="max-w-3xl text-slate-600">
          A built-in quality gate for accessibility QA reports. Score each report by reproducibility, evidence depth, and WCAG precision
          before sharing it with engineering.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-base">Evidence-first checks</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-600">Screenshots/video, environment matrix, and assistive tech context are scored automatically.</CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-base">Actionable recommendations</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-600">The system highlights the top missing fields to improve report quality in seconds.</CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-base">Better triage outcomes</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-600">Higher quality reports reduce ambiguity and speed up engineering reproduction.</CardContent>
        </Card>
      </div>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle>How it works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-700">
          <p>1. Fill your bug report draft in the generator.</p>
          <p>2. Review the quality score and grade in real time.</p>
          <p>3. Fix the top recommendations and export only when ready.</p>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <Link href="/sign-up" className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
          Start free
        </Link>
        <Link href="/news/keyboard-vs-screenreader" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">
          Read testing guide
        </Link>
      </div>
    </div>
  );
}
