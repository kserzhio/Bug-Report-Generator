import Link from "next/link";
import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Accessibility Release Checklist for QA Teams | Bug Writer",
  description:
    "Practical release checklist for accessibility QA: keyboard flows, screen reader checks, WCAG mapping, and evidence-ready bug reports.",
  alternates: {
    canonical: "/checklists/accessibility-release",
    languages: {
      "en-US": "/checklists/accessibility-release?lang=en",
      "uk-UA": "/checklists/accessibility-release?lang=uk",
      "x-default": "/checklists/accessibility-release"
    }
  }
};

const CHECK_ITEMS = [
  "Primary user journeys are fully keyboard operable (Tab/Shift+Tab/Enter/Space/Escape).",
  "Visible focus indicator is present and consistent across interactive controls.",
  "Focus is not obscured by sticky headers, drawers, or floating controls.",
  "Screen reader output is validated for labels, roles, and state changes.",
  "Live region/status message announcements are validated in async flows.",
  "WCAG criterion is mapped for each confirmed defect.",
  "Each high-severity defect includes reproduction steps and expected behavior.",
  "Browser/OS/device matrix is included in bug evidence.",
  "Assistive technology version is included when relevant (for example NVDA/VoiceOver).",
  "Each ticket has screenshots or video evidence for deterministic reproduction.",
  "Automated checks pass on release branch and manual exploratory checks cover critical paths.",
  "Release blockers are tagged and escalated with clear owner and ETA."
];

export default function AccessibilityReleaseChecklistPage() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
  const checklistSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "Accessibility Release Checklist",
    step: CHECK_ITEMS.map((item, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: item
    })),
    url: `${appUrl}/checklists/accessibility-release`
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
        name: "Checklists",
        item: `${appUrl}/checklists`
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Accessibility Release Checklist",
        item: `${appUrl}/checklists/accessibility-release`
      }
    ]
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(checklistSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/checklists" className="text-sm font-semibold text-primary">
            Back to checklists
          </Link>
        </div>
        <Badge className="bg-cyan-100 text-cyan-800">Release Checklist</Badge>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Accessibility Release Checklist</h1>
        <p className="max-w-3xl text-slate-600">
          Use this checklist before every release to reduce accessibility regressions and improve bug report quality.
        </p>
      </div>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle>Checklist</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {CHECK_ITEMS.map((item) => (
            <p key={item} className="text-sm text-slate-700">
              - {item}
            </p>
          ))}
        </CardContent>
      </Card>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle>Release Gate Recommendation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-700">
          <p>- Minimum quality score target before ticket export: 80%.</p>
          <p>- Critical and high-severity accessibility defects must have evidence and environment matrix.</p>
          <p>- Run one final keyboard + screen reader smoke pass on top business-critical flows.</p>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <Link href="/guides" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">
          Open guides
        </Link>
        <Link href="/wcag" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">
          Open WCAG hub
        </Link>
        <Link href="/sign-up" className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
          Start free
        </Link>
        <Link href="/compare/wcag-21-vs-22-for-qa" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">
          WCAG 2.1 vs 2.2
        </Link>
      </div>
    </div>
  );
}
