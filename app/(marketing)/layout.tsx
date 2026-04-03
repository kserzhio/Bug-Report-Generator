"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { LandingFooter } from "@/components/marketing/landing-footer";
import { LandingHeader } from "@/components/marketing/landing-header";

const SEGMENT_LABELS: Record<string, string> = {
  compare: "Compare",
  checklists: "Checklists",
  examples: "Examples",
  faq: "FAQ",
  features: "Features",
  guides: "Guides",
  news: "News",
  pricing: "Pricing",
  support: "Support",
  wcag: "WCAG",
  "wcag-bug-report-examples": "WCAG Bug Report Examples",
  "accessibility-bug-report-template": "Accessibility Bug Report Template"
};

function formatSegmentLabel(segment: string) {
  if (SEGMENT_LABELS[segment]) {
    return SEGMENT_LABELS[segment];
  }

  if (/^\d+\.\d+\.\d+$/.test(segment)) {
    return `WCAG ${segment}`;
  }

  return segment
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const pathSegments = pathname.split("/").filter(Boolean);

  let currentPath = "";
  const breadcrumbs = [
    { label: "Home", href: "/" },
    ...pathSegments.map((segment) => {
      currentPath += `/${segment}`;

      return {
        label: formatSegmentLabel(segment),
        href: currentPath
      };
    })
  ];

  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: `${appUrl}${item.href}`
    }))
  };

  return (
    <div className="landing-theme dark min-h-screen overflow-x-hidden">
      <LandingHeader />
      <div className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.45) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.45) 1px, transparent 1px)",
            backgroundSize: "60px 60px"
          }}
        />

        {!isHome ? (
          <div className="relative z-10 mx-auto max-w-7xl px-4 pt-20 sm:px-6 lg:px-8">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
            <nav aria-label="Breadcrumb">
              <ol className="flex flex-wrap items-center gap-2 text-sm">
                {breadcrumbs.map((crumb, index) => {
                  const isLast = index === breadcrumbs.length - 1;

                  return (
                    <li key={crumb.href} className="flex items-center gap-2">
                      {isLast ? (
                        <span className="font-medium text-[#F4F4F5]">{crumb.label}</span>
                      ) : (
                        <Link href={crumb.href} className="text-[#8B9BB4] transition-colors hover:text-white">
                          {crumb.label}
                        </Link>
                      )}
                      {!isLast ? <span className="text-[#4A5568]">/</span> : null}
                    </li>
                  );
                })}
              </ol>
            </nav>
          </div>
        ) : null}

        <main className={isHome ? "relative z-10" : "relative z-10 pb-12 pt-6"}>{children}</main>
      </div>
      <LandingFooter />
    </div>
  );
}
