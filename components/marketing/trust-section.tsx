"use client";

import { Compass, LayoutTemplate, TrendingUp } from "lucide-react";

const cards = [
  {
    icon: Compass,
    title: "Guided bug creation",
    description:
      "Step-by-step prompts walk you through every field — severity, WCAG criterion, environment, steps to reproduce. No more blank-page paralysis.",
    glow: "rgba(139,92,246,0.15)",
    iconColor: "#8B5CF6",
    iconBg: "rgba(139,92,246,0.12)"
  },
  {
    icon: LayoutTemplate,
    title: "Template-driven workflow",
    description:
      "Choose from 30+ templates for keyboard navigation, color contrast, screen reader compatibility, and more. Industry-standard structure, every time.",
    glow: "rgba(6,182,212,0.15)",
    iconColor: "#06B6D4",
    iconBg: "rgba(6,182,212,0.12)"
  },
  {
    icon: TrendingUp,
    title: "Ready for scale",
    description:
      "Connect to Jira, Azure DevOps, or GitHub Issues. Export to Markdown, JSON, or CSV. Built for teams that file hundreds of bugs a week.",
    glow: "rgba(16,185,129,0.15)",
    iconColor: "#10B981",
    iconBg: "rgba(16,185,129,0.12)"
  }
];

export function TrustSection() {
  return (
    <section id="features" className="relative py-24">
      <div
        className="absolute left-1/2 top-0 h-24 w-px -translate-x-1/2"
        style={{ background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.08), transparent)" }}
      />

      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <p
            className="mb-3 uppercase tracking-widest"
            style={{ fontSize: "11px", color: "#4A5568", fontWeight: 600, letterSpacing: "0.15em" }}
          >
            Why BugWriter
          </p>
          <h2
            className="mb-4"
            style={{ fontSize: "clamp(28px, 3.5vw, 40px)", fontWeight: 700, color: "#F4F4F5", letterSpacing: "-0.025em", lineHeight: 1.2 }}
          >
            Built for the way QA teams{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #8B5CF6, #06B6D4)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text"
              }}
            >
              actually work
            </span>
          </h2>
          <p style={{ fontSize: "16px", color: "#8B9BB4", maxWidth: "480px", margin: "0 auto", lineHeight: 1.6 }}>
            Three core capabilities that make every bug report faster, clearer, and more actionable.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {cards.map(({ icon: Icon, title, description, glow, iconColor, iconBg }) => (
            <div
              key={title}
              className="group relative cursor-default overflow-hidden rounded-2xl p-6 transition-all duration-300"
              style={{
                background: "linear-gradient(135deg, #151A21 0%, #0F1419 100%)",
                border: "1px solid rgba(255,255,255,0.06)"
              }}
            >
              <div
                className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{ boxShadow: `inset 0 0 40px ${glow}` }}
              />
              <div
                className="absolute left-8 right-8 top-0 h-px opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{ background: `linear-gradient(90deg, transparent, ${iconColor}40, transparent)` }}
              />

              <div
                className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
                style={{ background: iconBg, border: `1px solid ${iconColor}20` }}
              >
                <Icon size={18} style={{ color: iconColor }} />
              </div>

              <h3 className="mb-3" style={{ fontSize: "15px", fontWeight: 600, color: "#F4F4F5", letterSpacing: "-0.01em" }}>
                {title}
              </h3>
              <p style={{ fontSize: "14px", color: "#8B9BB4", lineHeight: 1.7 }}>{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
