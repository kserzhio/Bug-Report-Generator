import Link from "next/link";
import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Keyboard Navigation vs Screen Reader Testing | Bug Writer",
  description:
    "Understand the practical difference between keyboard-only accessibility testing and screen reader testing, with QA execution guidance.",
  alternates: {
    canonical: "/compare/keyboard-vs-screen-reader",
    languages: {
      "en-US": "/compare/keyboard-vs-screen-reader?lang=en",
      "uk-UA": "/compare/keyboard-vs-screen-reader?lang=uk",
      "x-default": "/compare/keyboard-vs-screen-reader"
    }
  }
};

export default function CompareKeyboardVsScreenReaderPage() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Keyboard Navigation vs Screen Reader Testing",
    description:
      "A practical comparison of keyboard operability checks and assistive technology announcement checks for accessibility QA.",
    mainEntityOfPage: `${appUrl}/compare/keyboard-vs-screen-reader`
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <div className="space-y-3">
        <Badge className="bg-cyan-100 text-cyan-800">Comparison</Badge>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Keyboard Navigation vs Screen Reader Testing</h1>
        <p className="max-w-3xl text-slate-600">
          Both are essential, but they validate different layers of accessibility quality.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>Keyboard Navigation Testing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-700">
            <p>- Validates operability through Tab, Shift+Tab, Enter, Space, Escape.</p>
            <p>- Focuses on focus order, visible focus, and trap behavior.</p>
            <p>- Detects interaction blockers for keyboard-only users.</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>Screen Reader Testing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-700">
            <p>- Validates semantic announcements: labels, roles, states, status updates.</p>
            <p>- Focuses on what NVDA/VoiceOver/JAWS actually announces.</p>
            <p>- Detects hidden semantic defects missed by visual and keyboard checks.</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle>Recommended QA Workflow</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-700">
          <p>1. Run keyboard flow checks first across critical user journeys.</p>
          <p>2. Repeat key journeys in a screen reader with deterministic steps.</p>
          <p>3. Log defects separately with WCAG mapping and evidence matrix.</p>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <Link href="/news/keyboard-vs-screenreader" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">
          Open detailed guide
        </Link>
        <Link href="/faq" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">
          Accessibility QA FAQ
        </Link>
      </div>
    </div>
  );
}
