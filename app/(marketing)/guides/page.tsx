import Link from "next/link";
import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Accessibility QA Guides | Bug Writer",
  description:
    "Practical accessibility QA guides for keyboard testing, screen readers, WCAG mapping, evidence collection, and bug triage quality.",
  alternates: {
    canonical: "/guides",
    languages: {
      "en-US": "/guides?lang=en",
      "uk-UA": "/guides?lang=uk",
      "x-default": "/guides"
    }
  }
};

const GUIDE_ITEMS = [
  {
    title: "Keyboard Navigation vs Screen Reader Testing",
    description: "Understand the difference between operability checks and semantic announcement validation.",
    href: "/news/keyboard-vs-screenreader"
  },
  {
    title: "Bug Report Quality Score",
    description: "Use score-driven QA workflow to improve reproducibility before export.",
    href: "/features/bug-report-quality-score"
  },
  {
    title: "Component Bug Examples Hub",
    description: "Review defect patterns by component: modal, form, table, navigation, tooltip.",
    href: "/examples"
  },
  {
    title: "WCAG Criteria Hub",
    description: "Map real defects to criteria with practical component links and examples.",
    href: "/wcag"
  },
  {
    title: "Keyboard vs Screen Reader (Comparison)",
    description: "Quickly compare what each testing mode validates and when to use both.",
    href: "/compare/keyboard-vs-screen-reader"
  },
  {
    title: "Manual vs Automated Accessibility Testing",
    description: "Build a balanced strategy across CI automation and manual QA depth.",
    href: "/compare/manual-vs-automated-accessibility-testing"
  },
  {
    title: "WCAG 2.1 vs 2.2 for QA Teams",
    description: "Understand what changed in 2.2 and how to update test coverage.",
    href: "/compare/wcag-21-vs-22-for-qa"
  },
  {
    title: "Accessibility QA FAQ",
    description: "Fast answers for recurring process and reporting questions.",
    href: "/faq"
  },
  {
    title: "Accessibility Bug Report Template",
    description: "Use a proven structure for reproducible, WCAG-aligned defect tickets.",
    href: "/accessibility-bug-report-template"
  },
  {
    title: "WCAG Bug Report Examples",
    description: "Review criterion-mapped examples you can adapt for daily QA triage.",
    href: "/wcag-bug-report-examples"
  }
];

export default function GuidesPage() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: GUIDE_ITEMS.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.title,
      url: `${appUrl}${item.href}`
    }))
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />

      <div className="space-y-3">
        <Badge className="bg-cyan-100 text-cyan-800">Guides</Badge>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Accessibility QA Guides</h1>
        <p className="max-w-3xl text-slate-600">
          Step-by-step guidance for accessibility testing and bug reporting workflows across keyboard, screen reader, and WCAG criteria.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {GUIDE_ITEMS.map((item) => (
          <Card key={item.href} className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-xl">
                <Link href={item.href}>{item.title}</Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">{item.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
