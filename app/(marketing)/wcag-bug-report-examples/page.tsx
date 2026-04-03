import Link from "next/link";
import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";

type BugExample = {
  slug: string;
  title: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  issueType: "Accessibility" | "Functional" | "Usability";
  component: string;
  wcag: string;
  description: string;
  actualBehavior: string;
  expectedBehavior: string;
  impact: string;
  steps: string[];
  recommendations: string[];
  fixSnippet: string;
};

export const metadata: Metadata = {
  title: "WCAG Bug Report Examples | Bug Writer",
  description:
    "Explore practical accessibility bug report examples in a triage-ready format mapped to WCAG criteria.",
  alternates: {
    canonical: "/wcag-bug-report-examples",
    languages: {
      "en-US": "/wcag-bug-report-examples?lang=en",
      "uk-UA": "/wcag-bug-report-examples?lang=uk",
      "x-default": "/wcag-bug-report-examples"
    }
  }
};

const EXAMPLES: BugExample[] = [
  {
    slug: "focus-order-navigation-sequence-mismatch",
    title: "2.4.3 Focus Order - Navigation sequence mismatch",
    severity: "High",
    issueType: "Accessibility",
    component: "Primary Navigation",
    wcag: "WCAG 2.2 - 2.4.3 Focus Order",
    description: "Keyboard focus jumps from header to footer before main navigation links.",
    actualBehavior:
      "When tabbing from the logo, focus moves to the newsletter input in the footer instead of top navigation links.",
    expectedBehavior:
      "Focus order should follow visual and logical structure: logo -> navigation links -> main content -> footer.",
    impact:
      "Keyboard-only users lose context and may miss critical navigation actions.",
    steps: [
      "Open the home page and place focus on the logo.",
      "Press Tab repeatedly to move through interactive elements.",
      "Observe that focus jumps to footer input before header navigation."
    ],
    recommendations: [
      "Align DOM order with intended visual reading/navigation order.",
      "Avoid positive tabindex values and focus traps outside active context.",
      "Run keyboard-only smoke test on each major page template."
    ],
    fixSnippet: `// Keep DOM order aligned with visual order
<header>
  <a href="#main" className="skip-link">Skip to content</a>
  <nav aria-label="Primary navigation">...</nav>
</header>
<main id="main">...</main>`
  },
  {
    slug: "dialog-not-announced",
    title: "4.1.2 Name, Role, Value - Dialog not announced",
    severity: "Critical",
    issueType: "Accessibility",
    component: "Checkout Confirmation Modal",
    wcag: "WCAG 2.2 - 4.1.2 Name, Role, Value",
    description: "Confirmation modal opens visually but is not announced as a dialog by screen readers.",
    actualBehavior:
      "Screen readers continue reading background content and do not announce modal title or state when opened.",
    expectedBehavior:
      "Modal should be announced with role=dialog (or alertdialog), accessible name, and initial focus inside the dialog.",
    impact:
      "Screen reader users may not realize a modal opened and cannot complete confirmation flow reliably.",
    steps: [
      "Open checkout page and trigger confirmation modal.",
      "Run with NVDA or VoiceOver and activate modal button.",
      "Verify that modal title/state are not announced and focus is not managed."
    ],
    recommendations: [
      "Set dialog semantics (role, aria-modal, aria-labelledby/aria-describedby).",
      "Move focus into modal on open and restore focus on close.",
      "Hide inert background content from assistive technologies while modal is open."
    ],
    fixSnippet: `<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="checkout-confirm-title"
  aria-describedby="checkout-confirm-desc"
>
  ...
</div>`
  },
  {
    slug: "form-validation-error-not-associated",
    title: "3.3.1 Error Identification - Form validation error not associated",
    severity: "High",
    issueType: "Accessibility",
    component: "Registration Form",
    wcag: "WCAG 2.2 - 3.3.1 Error Identification",
    description: "Validation message appears visually but is not linked to the invalid field programmatically.",
    actualBehavior:
      "Email field turns red and error text appears below, but screen readers do not announce error when field receives focus.",
    expectedBehavior:
      "Invalid field should expose aria-invalid and reference error text via aria-describedby.",
    impact:
      "Users with assistive tech may know a field failed but not understand what to fix.",
    steps: [
      "Open registration form and submit invalid email value.",
      "Tab back to email input with screen reader enabled.",
      "Observe missing announcement of specific validation error."
    ],
    recommendations: [
      "Set aria-invalid='true' on invalid inputs.",
      "Associate visible error text with input using aria-describedby.",
      "Announce form-level errors via polite live region when submitting."
    ],
    fixSnippet: `<input
  id="email"
  aria-invalid="true"
  aria-describedby="email-error"
/>
<p id="email-error">Enter a valid email address.</p>`
  },
  {
    slug: "tooltip-hover-only-behavior",
    title: "1.4.13 Content on Hover or Focus - Tooltip hover-only behavior",
    severity: "Medium",
    issueType: "Accessibility",
    component: "Plan Info Tooltip",
    wcag: "WCAG 2.2 - 1.4.13 Content on Hover or Focus",
    description: "Tooltip appears on mouse hover only and cannot be triggered with keyboard focus.",
    actualBehavior:
      "Tabbing to info icon does not reveal tooltip content; ESC does not dismiss because tooltip never opens via keyboard.",
    expectedBehavior:
      "Tooltip must appear on both hover and keyboard focus, remain visible while hovered/focused, and be dismissible.",
    impact:
      "Keyboard users miss explanatory pricing details and may make incorrect plan decisions.",
    steps: [
      "Navigate to pricing section and focus the info icon via keyboard.",
      "Check whether tooltip appears on focus.",
      "Attempt dismiss with Escape and confirm behavior."
    ],
    recommendations: [
      "Trigger tooltip on focus as well as hover.",
      "Ensure tooltip stays visible while pointer/focus is inside trigger/content.",
      "Support Escape dismissal and prevent content from blocking adjacent UI."
    ],
    fixSnippet: `.info-trigger:focus + .tooltip,
.info-trigger:hover + .tooltip {
  display: block;
}

.tooltip {
  max-width: 280px;
}`
  }
];

function severityClass(severity: BugExample["severity"]) {
  if (severity === "Critical") return "from-[#ff3045] to-[#ff1f35]";
  if (severity === "High") return "from-[#ff7a1a] to-[#ff5b00]";
  if (severity === "Low") return "from-[#16a34a] to-[#15803d]";
  return "from-[#f59e0b] to-[#d97706]";
}

function ExamplePreview({ example }: { example: BugExample }) {
  return (
    <article
      id={example.slug}
      className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#121822] to-[#0b1220] p-6 shadow-2xl"
    >
      <h2 className="mb-3 text-2xl font-semibold text-white">Bug Report: {example.component}</h2>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className={`inline-flex items-center gap-2 rounded-lg bg-gradient-to-r px-4 py-2 text-sm font-semibold text-white ${severityClass(example.severity)}`}>
          <span className="h-2 w-2 rounded-full bg-white" />
          Severity: {example.severity}
        </div>
        <div className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300">
          Type: {example.issueType}
        </div>
      </div>

      <div className="mb-5 rounded-lg border border-white/10 bg-white/5 p-4">
        <p className="mb-1 text-xs text-zinc-500">WCAG GUIDELINE</p>
        <p className="text-sm font-medium text-white">{example.wcag}</p>
      </div>

      <div className="space-y-5">
        <section>
          <h3 className="mb-2 text-sm text-zinc-400">DESCRIPTION</h3>
          <p className="leading-relaxed text-white">{example.description}</p>
        </section>

        <section>
          <h3 className="mb-2 text-sm text-zinc-400">ACTUAL BEHAVIOR</h3>
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
            <p className="leading-relaxed text-white">{example.actualBehavior}</p>
          </div>
        </section>

        <section>
          <h3 className="mb-2 text-sm text-zinc-400">EXPECTED BEHAVIOR</h3>
          <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4">
            <p className="leading-relaxed text-white">{example.expectedBehavior}</p>
          </div>
        </section>

        <section>
          <h3 className="mb-2 text-sm text-zinc-400">IMPACT</h3>
          <p className="leading-relaxed text-white">{example.impact}</p>
        </section>

        <section>
          <h3 className="mb-2 text-sm text-zinc-400">STEPS TO REPRODUCE</h3>
          <ol className="space-y-2 text-white">
            {example.steps.map((step, index) => (
              <li key={step} className="flex gap-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#E41F07]/20 text-sm text-[#E41F07]">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </section>

        <section>
          <h3 className="mb-2 text-sm text-zinc-400">RECOMMENDATIONS</h3>
          <ul className="space-y-2 text-white">
            {example.recommendations.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-1 text-[#E41F07]">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h3 className="mb-2 text-sm text-zinc-400">SUGGESTED FIX</h3>
          <div className="rounded-lg border border-white/10 bg-[#0a1020] p-4">
            <pre className="overflow-x-auto whitespace-pre-wrap break-words text-xs leading-6 text-[#a78bfa]">
              {example.fixSnippet}
            </pre>
          </div>
        </section>
      </div>
    </article>
  );
}

export default function WcagBugReportExamplesPage() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: EXAMPLES.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.title,
      url: `${appUrl}/wcag-bug-report-examples#${item.slug}`
    }))
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />

      <div className="space-y-3">
        <Badge className="border border-[#06b6d4]/40 bg-[#06b6d4]/10 text-[#67e8f9]">Examples</Badge>
        <h1 className="text-3xl font-semibold tracking-tight text-white">WCAG Bug Report Examples</h1>
        <p className="max-w-3xl text-[#8B9BB4]">
          Real, triage-ready accessibility bug reports with severity, WCAG mapping, impact, steps to reproduce, and suggested fix snippets.
        </p>
      </div>

      <div className="space-y-6">
        {EXAMPLES.map((example) => (
          <ExamplePreview key={example.slug} example={example} />
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Link href="/wcag" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-[#C4CDD6] transition-colors hover:text-white">
          Open WCAG hub
        </Link>
        <Link href="/examples" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-[#C4CDD6] transition-colors hover:text-white">
          Component examples
        </Link>
        <Link href="/accessibility-bug-report-template" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-[#C4CDD6] transition-colors hover:text-white">
          Bug report template
        </Link>
      </div>
    </div>
  );
}
