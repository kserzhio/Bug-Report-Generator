"use client";

import { Bug } from "lucide-react";
import Link from "next/link";

const footerLinks = [
  {
    group: "Product",
    links: [
      { label: "Features", href: "/#features" },
      { label: "Templates", href: "/#templates" },
      { label: "Pricing", href: "/#pricing" },
      { label: "Changelog", href: "/news" },
      { label: "Roadmap", href: "/pricing" }
    ]
  },
  {
    group: "Docs",
    links: [
      { label: "Getting started", href: "/guides" },
      { label: "API reference", href: "/faq" },
      { label: "WCAG guide", href: "/wcag" },
      { label: "Integrations", href: "/examples" },
      { label: "Examples", href: "/wcag-bug-report-examples" }
    ]
  },
  {
    group: "Company",
    links: [
      { label: "About", href: "/faq" },
      { label: "Blog", href: "/news" },
      { label: "Support", href: "/support" },
      { label: "Privacy", href: "/faq" },
      { label: "Terms", href: "/faq" }
    ]
  }
] as const;

const legalLinks = [
  { label: "Privacy", href: "/faq" },
  { label: "Terms", href: "/faq" },
  { label: "Cookies", href: "/faq" },
  { label: "Support", href: "/support" }
] as const;

export function LandingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="relative border-t"
      style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(8,11,16,0.8)" }}
    >
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-14 grid grid-cols-2 gap-10 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="group mb-4 flex items-center gap-2.5">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg"
                style={{ background: "linear-gradient(135deg, #E41F07 0%, #FF6B35 100%)" }}
              >
                <Bug size={15} className="text-white" />
              </div>
              <span style={{ fontSize: "15px", fontWeight: 600, color: "#F4F4F5", letterSpacing: "-0.01em" }}>
                Bug<span style={{ color: "#E41F07" }}>Writer</span>
              </span>
            </Link>
            <p style={{ fontSize: "13px", color: "#4A5568", lineHeight: 1.7, maxWidth: "220px" }}>
              Polished accessibility bug reports for QA engineers and developers.
            </p>
            <div className="mt-5 flex items-center gap-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-[#10B981]" />
              <span style={{ fontSize: "11px", color: "#10B981" }}>All systems operational</span>
            </div>
          </div>

          {footerLinks.map(({ group, links }) => (
            <div key={group}>
              <p
                className="mb-4"
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#F4F4F5",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em"
                }}
              >
                {group}
              </p>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="transition-colors duration-150 hover:text-white"
                      style={{ fontSize: "13px", color: "#4A5568" }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          className="flex flex-wrap items-center justify-between gap-4 pt-7"
          style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
        >
          <p style={{ fontSize: "12px", color: "#4A5568" }}>
            Copyright {year} BugWriter. Built for QA engineers worldwide.
          </p>
          <div className="flex items-center gap-5">
            {legalLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="transition-colors hover:text-white"
                style={{ fontSize: "12px", color: "#4A5568" }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
