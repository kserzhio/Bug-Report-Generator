import Link from "next/link";
import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Accessibility QA Checklists | Bug Writer",
  description:
    "Actionable QA checklists for accessibility release readiness, evidence collection, and reproducible defect reporting.",
  alternates: {
    canonical: "/checklists",
    languages: {
      "en-US": "/checklists?lang=en",
      "uk-UA": "/checklists?lang=uk",
      "x-default": "/checklists"
    }
  }
};

const CHECKLISTS = [
  {
    title: "Accessibility Release Checklist",
    description: "Pre-release QA checklist for keyboard, screen reader, WCAG mapping, and evidence quality.",
    href: "/checklists/accessibility-release"
  }
];

export default function ChecklistsPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-3">
        <Badge className="bg-cyan-100 text-cyan-800">Checklists</Badge>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Accessibility QA Checklists</h1>
        <p className="max-w-3xl text-slate-600">
          Lightweight operational checklists to improve release confidence and defect quality consistency.
        </p>
      </div>

      <div className="grid gap-5">
        {CHECKLISTS.map((item) => (
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
