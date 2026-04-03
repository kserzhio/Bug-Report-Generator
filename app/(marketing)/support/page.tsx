import Link from "next/link";
import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Support | Bug Writer",
  description:
    "Contact Bug Writer support for account access, billing, bug report issues, integrations, or feature requests.",
  alternates: {
    canonical: "/support",
    languages: {
      "en-US": "/support?lang=en",
      "uk-UA": "/support?lang=uk",
      "x-default": "/support"
    }
  }
};

const supportTopics = [
  {
    title: "Account & Login",
    text: "Sign-in issues, password reset, and profile access."
  },
  {
    title: "Billing & Plans",
    text: "Free/Pro plan questions, upgrade, invoices, and Stripe-related issues."
  },
  {
    title: "Integrations",
    text: "Jira, Azure DevOps, Linear, GitHub export setup and troubleshooting."
  },
  {
    title: "Feature Requests",
    text: "Share product ideas, workflow requests, or SEO content suggestions."
  }
] as const;

function mailto(subject: string, body: string) {
  return `mailto:hello@bugwriter.app?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export default function SupportPage() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
  const contactSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Bug Writer Support",
    url: `${appUrl}/support`
  };

  const defaultTemplate =
    "Hi BugWriter team,\n\nI need help with:\n- \n\nMy account email:\nPage URL:\nBrowser/device:\n\nThanks!";

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(contactSchema) }} />

      <div className="space-y-3">
        <Badge className="bg-cyan-100 text-cyan-800">Support</Badge>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Contact Support</h1>
        <p className="max-w-3xl text-slate-600">
          Need help? Send us a message and we will get back to you as soon as possible.
        </p>
      </div>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle>Write to us</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-slate-700">
          <p>
            Email:{" "}
            <a className="font-semibold text-cyan-300 hover:text-cyan-200" href="mailto:hello@bugwriter.app">
              hello@bugwriter.app
            </a>
          </p>
          <div className="flex flex-wrap gap-3">
            <a href={mailto("Support Request", defaultTemplate)}>
              <Button>Open Support Email</Button>
            </a>
            <a href={mailto("BugWriter Billing Question", "Hi team,\n\nI need help with billing:") }>
              <Button variant="outline">Billing Support</Button>
            </a>
            <a href={mailto("BugWriter Feature Request", "Hi team,\n\nFeature request:") }>
              <Button variant="outline">Feature Request</Button>
            </a>
          </div>
          <p className="text-slate-600">
            Tip: include your account email, exact page URL, and reproduction steps to speed up resolution.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-5 md:grid-cols-2">
        {supportTopics.map((topic) => (
          <Card key={topic.title} className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-base">{topic.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600">{topic.text}</CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Link href="/faq" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">
          Open FAQ
        </Link>
        <Link href="/news" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">
          Read product updates
        </Link>
      </div>
    </div>
  );
}
