import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import type { ReactNode } from "react";
import { Toaster } from "sonner";

import "@/app/globals.css";

import { LocaleProvider } from "@/components/providers/locale-provider";
import { getRequestLocale } from "@/lib/i18n/server";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans"
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: "Bug Writer for QA & Accessibility",
  description:
    "Generate polished accessibility and QA bug reports with structured templates and team-ready workflows.",
  alternates: {
    canonical: "/",
    languages: {
      "en-US": "/?lang=en",
      "uk-UA": "/?lang=uk",
      "x-default": "/"
    }
  },
  openGraph: {
    title: "Bug Writer for QA & Accessibility",
    description:
      "Generate polished accessibility and QA bug reports with structured templates and team-ready workflows.",
    url: "/",
    siteName: "Bug Writer",
    locale: "en_US",
    type: "website"
  }
};

export default async function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  const locale = await getRequestLocale();
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Bug Writer",
    url: appUrl,
    logo: `${appUrl}/icon.png`,
    sameAs: [],
    description: "Accessibility QA bug reporting platform."
  };
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Bug Writer",
    url: appUrl,
    inLanguage: ["en", "uk"]
  };

  return (
    <html lang={locale}>
      <body className={manrope.variable}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
        <LocaleProvider locale={locale}>
          {children}
          <Toaster richColors position="top-right" closeButton />
        </LocaleProvider>
      </body>
    </html>
  );
}
