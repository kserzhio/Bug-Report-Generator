"use client";

import type { CSSProperties, ComponentType } from "react";
import { Code2, Map, Layers, Download } from "lucide-react";

const features = [
  {
    icon: Code2,
    title: "Fix suggestions with code",
    description:
      "Every bug report auto-generates a ready-to-implement code fix. CSS, HTML, ARIA attributes — the right solution for the right violation.",
    detail: "Supports React, Vue, Angular, HTML/CSS, and iOS/Android native patterns.",
    color: "#8B5CF6",
    bg: "rgba(139,92,246,0.08)",
    code: `.button:focus-visible {\n  outline: 2px solid #6366F1;\n  outline-offset: 2px;\n  border-radius: 4px;\n}`
  },
  {
    icon: Map,
    title: "WCAG criterion mapping",
    description:
      "Automatic tagging to the exact WCAG 2.1/2.2 success criterion. Level A, AA, AAA — with links to the official guideline and common test techniques.",
    detail: "Covers all 78 WCAG 2.2 criteria plus ARIA 1.2 patterns.",
    color: "#06B6D4",
    bg: "rgba(6,182,212,0.08)",
    tags: ["1.4.3 Contrast", "2.4.7 Focus", "4.1.2 Name Role", "1.1.1 Non-text"]
  },
  {
    icon: Layers,
    title: "Component-based generation",
    description:
      "Connect your design system. BugWriter maps bugs to specific UI components, making triage faster and ensuring no issue gets lost in translation.",
    detail: "Integrates with Storybook, Figma tokens, and component libraries.",
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.08)",
    stats: [
      { label: "Components mapped", value: "240" },
      { label: "Avg triage time", value: "−64%" }
    ]
  },
  {
    icon: Download,
    title: "Export to Jira / ADO",
    description:
      "One-click export to Jira, Azure DevOps, GitHub Issues, or Linear. Field mapping is fully configurable — severity, labels, custom fields.",
    detail: "Also exports to Markdown, JSON, CSV, and PDF.",
    color: "#10B981",
    bg: "rgba(16,185,129,0.08)",
    integrations: ["Jira", "ADO", "GitHub", "Linear", "Notion"]
  }
];

function FeatureCard({ icon: Icon, title, description, detail, color, bg, code, tags, stats, integrations }: {
  icon: ComponentType<{ size?: number; style?: CSSProperties }>;
  title: string;
  description: string;
  detail: string;
  color: string;
  bg: string;
  code?: string;
  tags?: string[];
  stats?: Array<{ label: string; value: string }>;
  integrations?: string[];
}) {
  return (
    <div
      className="group flex h-full flex-col gap-4 rounded-2xl p-6 transition-all duration-300"
      style={{ background: "linear-gradient(135deg, #151A21 0%, #0F1419 100%)", border: "1px solid rgba(255,255,255,0.06)" }}
    >
      <div className="flex items-start gap-4">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
          style={{ background: bg, border: `1px solid ${color}25` }}
        >
          <Icon size={18} style={{ color }} />
        </div>
        <div>
          <h3 className="mb-1" style={{ fontSize: "15px", fontWeight: 600, color: "#F4F4F5" }}>
            {title}
          </h3>
          <p style={{ fontSize: "13px", color: "#8B9BB4", lineHeight: 1.65 }}>{description}</p>
        </div>
      </div>

      {code ? (
        <div className="rounded-lg p-3 font-mono" style={{ background: "#0D1117", border: "1px solid rgba(255,255,255,0.05)" }}>
          <pre style={{ fontSize: "11px", color: "#A78BFA", lineHeight: 1.7 }}>{code}</pre>
        </div>
      ) : null}
      {tags ? (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span key={tag} className="rounded-md px-2.5 py-1" style={{ fontSize: "11px", color: "#06B6D4", background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.12)" }}>
              {tag}
            </span>
          ))}
        </div>
      ) : null}
      {stats ? (
        <div className="grid grid-cols-2 gap-3">
          {stats.map(({ label, value }) => (
            <div key={label} className="rounded-lg p-3 text-center" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <p style={{ fontSize: "20px", fontWeight: 700, color: "#F59E0B", lineHeight: 1 }}>{value}</p>
              <p style={{ fontSize: "11px", color: "#8B9BB4", marginTop: "4px" }}>{label}</p>
            </div>
          ))}
        </div>
      ) : null}
      {integrations ? (
        <div className="flex flex-wrap gap-2">
          {integrations.map((name) => (
            <span key={name} className="rounded-lg px-3 py-1.5" style={{ fontSize: "12px", color: "#8B9BB4", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              {name}
            </span>
          ))}
        </div>
      ) : null}

      <p style={{ fontSize: "12px", color: "#4A5568", marginTop: "auto" }}>{detail}</p>
    </div>
  );
}

export function FeatureDetails() {
  return (
    <section className="py-24" id="feature-details">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <p className="mb-3 uppercase tracking-widest" style={{ fontSize: "11px", color: "#4A5568", fontWeight: 600, letterSpacing: "0.15em" }}>
            Deep features
          </p>
          <h2 style={{ fontSize: "clamp(26px, 3.5vw, 38px)", fontWeight: 700, color: "#F4F4F5", letterSpacing: "-0.025em", lineHeight: 1.2 }}>
            Everything a QA team needs,{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #8B5CF6, #F59E0B)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text"
              }}
            >
              nothing it doesn't
            </span>
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
