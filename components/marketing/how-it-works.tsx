"use client";

import { FileText, Cpu, Share2 } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: FileText,
    title: "Select template or describe issue",
    description:
      "Pick from 30+ pre-built templates organized by WCAG criterion, or describe the issue in plain language. BugWriter auto-selects the right structure.",
    color: "#8B5CF6",
    bg: "rgba(139,92,246,0.08)",
    border: "rgba(139,92,246,0.15)"
  },
  {
    number: "02",
    icon: Cpu,
    title: "Generate structured bug report",
    description:
      "AI fills in WCAG details, severity ratings, environment fields, and reproduction steps. A quality score validates the report in real time.",
    color: "#06B6D4",
    bg: "rgba(6,182,212,0.08)",
    border: "rgba(6,182,212,0.15)"
  },
  {
    number: "03",
    icon: Share2,
    title: "Export or share instantly",
    description:
      "One click to Jira, Azure DevOps, GitHub Issues, or Markdown. Share a permanent link or copy formatted output ready to paste anywhere.",
    color: "#10B981",
    bg: "rgba(16,185,129,0.08)",
    border: "rgba(16,185,129,0.15)"
  }
];

export function HowItWorks() {
  return (
    <section className="relative overflow-hidden py-24">
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "40px 40px"
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <p
            className="mb-3 uppercase tracking-widest"
            style={{ fontSize: "11px", color: "#4A5568", fontWeight: 600, letterSpacing: "0.15em" }}
          >
            How it works
          </p>
          <h2
            style={{
              fontSize: "clamp(26px, 3.5vw, 38px)",
              fontWeight: 700,
              color: "#F4F4F5",
              letterSpacing: "-0.025em",
              lineHeight: 1.2
            }}
          >
            From issue to filed report{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #F59E0B, #E41F07)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text"
              }}
            >
              in 3 steps
            </span>
          </h2>
        </div>

        <div className="relative">
          <div
            className="absolute left-[calc(16.66%+2rem)] right-[calc(16.66%+2rem)] top-14 hidden h-px lg:block"
            style={{ background: "linear-gradient(90deg, rgba(139,92,246,0.3), rgba(6,182,212,0.3), rgba(16,185,129,0.3))" }}
          />

          <div className="relative grid gap-6 lg:grid-cols-3">
            {steps.map(({ number, icon: Icon, title, description, color, bg, border }) => (
              <div
                key={number}
                className="group relative rounded-2xl p-6 pt-8 transition-all duration-300"
                style={{ background: "linear-gradient(135deg, #151A21 0%, #0F1419 100%)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <div
                  className="absolute -top-4 left-6 rounded-full px-3 py-1"
                  style={{ fontSize: "11px", fontWeight: 700, color, background: bg, border: `1px solid ${border}` }}
                >
                  {number}
                </div>

                <div
                  className="absolute -top-[2.5px] left-1/2 hidden h-2 w-2 -translate-x-1/2 items-center justify-center rounded-full lg:flex"
                  style={{ background: color, boxShadow: `0 0 8px ${color}` }}
                />

                <div
                  className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
                  style={{ background: bg, border: `1px solid ${border}` }}
                >
                  <Icon size={20} style={{ color }} />
                </div>

                <h3 className="mb-3" style={{ fontSize: "15px", fontWeight: 600, color: "#F4F4F5", letterSpacing: "-0.01em" }}>
                  {title}
                </h3>
                <p style={{ fontSize: "13px", color: "#8B9BB4", lineHeight: 1.7 }}>{description}</p>

                <div
                  className="absolute left-4 right-4 top-0 h-px opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{ background: `linear-gradient(90deg, transparent, ${color}50, transparent)` }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
