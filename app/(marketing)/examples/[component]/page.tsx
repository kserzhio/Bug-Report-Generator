import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getAllExampleComponents,
  getComponentExampleIssues
} from "@/src/domain/services/component-examples-service";
import { extractWcagCodesFromText } from "@/src/domain/services/wcag-content-service";

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function generateStaticParams() {
  return getAllExampleComponents().map((component) => ({ component }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ component: string }>;
}): Promise<Metadata> {
  const { component } = await params;
  const issues = getComponentExampleIssues(component);

  if (issues.length === 0) {
    return {
      title: "Component examples not found | Bug Writer"
    };
  }

  const componentTitle = capitalize(component);

  return {
    title: `${componentTitle} Accessibility Bug Examples | Bug Writer`,
    description: `Practical ${componentTitle.toLowerCase()} accessibility bug examples with WCAG mapping, severity, and reproducible report format.`,
    alternates: {
      canonical: `/examples/${component}`,
      languages: {
        "en-US": `/examples/${component}?lang=en`,
        "uk-UA": `/examples/${component}?lang=uk`,
        "x-default": `/examples/${component}`
      }
    }
  };
}

export default async function ComponentExamplesDetailPage({
  params
}: {
  params: Promise<{ component: string }>;
}) {
  const { component } = await params;
  const issues = getComponentExampleIssues(component);

  if (issues.length === 0) {
    notFound();
  }

  const componentTitle = capitalize(component);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `What are common accessibility bugs for ${componentTitle}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Common ${componentTitle.toLowerCase()} accessibility bugs include keyboard flow issues, missing semantics, announcement problems, and weak focus behavior depending on interaction type.`
        }
      },
      {
        "@type": "Question",
        name: `How should ${componentTitle} accessibility bugs be reported?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: "Include clear reproduction steps, browser/OS/device matrix, assistive technology details, evidence links, and WCAG mapping in each report."
        }
      }
    ]
  };

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: issues.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.title,
      url: `${appUrl}/examples/${component}`
    }))
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/examples" className="text-sm font-semibold text-primary">
            Back to examples hub
          </Link>
          <span className="text-sm text-muted-foreground">/</span>
          <span className="text-sm text-muted-foreground">{componentTitle}</span>
        </div>
        <Badge className="bg-cyan-100 text-cyan-800">{componentTitle}</Badge>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">{componentTitle} Accessibility Bug Examples</h1>
        <p className="max-w-3xl text-slate-600">
          Reusable issue patterns with severity, affected users, expected behavior, and WCAG criterion mapping.
        </p>
      </div>

      <div className="space-y-4">
        {issues.map((issue) => (
          <Card key={issue.slug} className="border-slate-200">
            <CardHeader className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-slate-100 text-slate-700">{issue.severity}</Badge>
                <Badge className="bg-white text-slate-700 border border-slate-200">{issue.category}</Badge>
              </div>
              <CardTitle className="text-xl">{issue.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-700">
              <p>
                <span className="font-semibold text-slate-950">Affected users:</span> {issue.affectedUsers}
              </p>
              <p>
                <span className="font-semibold text-slate-950">Actual:</span> {issue.actualBehavior}
              </p>
              <p>
                <span className="font-semibold text-slate-950">Expected:</span> {issue.expectedBehavior}
              </p>
              <p>
                <span className="font-semibold text-slate-950">WCAG:</span> {issue.wcagCriterion}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                {extractWcagCodesFromText(issue.wcagCriterion).map((code) => (
                  <Link
                    key={`${issue.slug}-${code}`}
                    href={`/wcag/${code}`}
                    className="rounded-full border border-cyan-200 px-2 py-1 text-xs font-semibold text-cyan-700"
                  >
                    {code}
                  </Link>
                ))}
              </div>
              <p>
                <span className="font-semibold text-slate-950">QA note:</span> {issue.notes}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Link href="/sign-up" className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
          Start free
        </Link>
        <Link href="/features/bug-report-quality-score" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">
          Improve report quality
        </Link>
      </div>
    </div>
  );
}
