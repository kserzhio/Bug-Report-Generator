import Link from "next/link";
import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Accessibility QA FAQ | Bug Writer",
  description:
    "FAQ for accessibility QA teams: testing strategy, WCAG mapping, bug evidence quality, and triage best practices.",
  alternates: {
    canonical: "/faq",
    languages: {
      "en-US": "/faq?lang=en",
      "uk-UA": "/faq?lang=uk",
      "x-default": "/faq"
    }
  }
};

const FAQ_ITEMS = [
  {
    q: "What is the difference between keyboard navigation testing and screen reader testing?",
    a: "Keyboard testing verifies operability and focus flow; screen reader testing verifies semantic announcements, roles, labels, and state changes."
  },
  {
    q: "Can automated accessibility tests replace manual QA?",
    a: "No. Automated checks catch only part of defects. Manual testing is required for interaction quality, AT behavior, and contextual usability."
  },
  {
    q: "What evidence should an accessibility bug report include?",
    a: "Include deterministic reproduction steps, browser/OS/device matrix, assistive technology version, WCAG mapping, and screenshots or video."
  },
  {
    q: "How do we prioritize accessibility defects?",
    a: "Prioritize by user impact, workflow criticality, and reproducibility risk. Blocking keyboard or AT flows should be treated as high severity."
  }
];

export default function FaqPage() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a
      }
    }))
  };

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Keyboard vs Screen Reader", url: `${appUrl}/compare/keyboard-vs-screen-reader` },
      {
        "@type": "ListItem",
        position: 2,
        name: "Manual vs Automated Accessibility Testing",
        url: `${appUrl}/compare/manual-vs-automated-accessibility-testing`
      }
    ]
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
        name: "FAQ",
        item: `${appUrl}/faq`
      }
    ]
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <div className="space-y-3">
        <Badge className="bg-cyan-100 text-cyan-800">FAQ</Badge>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Accessibility QA FAQ</h1>
        <p className="max-w-3xl text-slate-600">
          Quick answers for teams building repeatable accessibility QA workflows and higher-quality bug reports.
        </p>
      </div>

      <div className="space-y-4">
        {FAQ_ITEMS.map((item) => (
          <Card key={item.q} className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-base">{item.q}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-700">{item.a}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Link href="/compare/keyboard-vs-screen-reader" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">
          Keyboard vs screen reader
        </Link>
        <Link
          href="/compare/manual-vs-automated-accessibility-testing"
          className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
        >
          Manual vs automated testing
        </Link>
      </div>
    </div>
  );
}
