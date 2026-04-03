import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getWcagCriteriaSummaries,
  getWcagCriterionSummaryByCode
} from "@/src/domain/services/wcag-content-service";

export function generateStaticParams() {
  return getWcagCriteriaSummaries().map((item) => ({ criterion: item.code }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ criterion: string }>;
}): Promise<Metadata> {
  const { criterion } = await params;
  const summary = getWcagCriterionSummaryByCode(criterion);

  if (!summary) {
    return {
      title: "WCAG criterion not found | Bug Writer"
    };
  }

  return {
    title: `${summary.code} ${summary.title} Examples | Bug Writer`,
    description: `Practical QA examples and bug reporting patterns for WCAG ${summary.code} ${summary.title}.`,
    alternates: {
      canonical: `/wcag/${summary.code}`,
      languages: {
        "en-US": `/wcag/${summary.code}?lang=en`,
        "uk-UA": `/wcag/${summary.code}?lang=uk`,
        "x-default": `/wcag/${summary.code}`
      }
    }
  };
}

export default async function WcagDetailPage({
  params
}: {
  params: Promise<{ criterion: string }>;
}) {
  const { criterion } = await params;
  const summary = getWcagCriterionSummaryByCode(criterion);

  if (!summary) {
    notFound();
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `How to test WCAG ${summary.code}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: "Test keyboard flow, semantic announcements, and evidence reproducibility in the target user journey and report both actual and expected behavior."
        }
      },
      {
        "@type": "Question",
        name: `How to write a bug report for WCAG ${summary.code}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: "Include criterion mapping, deterministic reproduction steps, browser/OS/device matrix, assistive technology details, and screenshots or video evidence."
        }
      }
    ]
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "WCAG Hub", item: `${appUrl}/wcag` },
      { "@type": "ListItem", position: 2, name: summary.code, item: `${appUrl}/wcag/${summary.code}` }
    ]
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/wcag" className="text-sm font-semibold text-primary">
            Back to WCAG hub
          </Link>
          <span className="text-sm text-muted-foreground">/</span>
          <span className="text-sm text-muted-foreground">{summary.code}</span>
        </div>
        <Badge className="bg-cyan-100 text-cyan-800">WCAG Criterion</Badge>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
          {summary.code} {summary.title}
        </h1>
        <p className="max-w-3xl text-slate-600">
          This criterion appears in {summary.mentionCount} practical QA patterns across components.
        </p>
      </div>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle>Related Components</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {summary.components.map((component) => (
            <Link
              key={`${summary.code}-${component}`}
              href={`/examples/${component}`}
              className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700"
            >
              {component}
            </Link>
          ))}
        </CardContent>
      </Card>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle>Related Example Titles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {summary.examples.map((example) => (
            <p key={`${summary.code}-${example}`} className="text-sm text-slate-700">
              - {example}
            </p>
          ))}
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <Link href="/examples" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">
          Explore all components
        </Link>
        <Link href="/features/bug-report-quality-score" className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
          Improve report quality
        </Link>
      </div>
    </div>
  );
}
