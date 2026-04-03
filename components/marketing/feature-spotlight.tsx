"use client";

import Link from "next/link";
import { Award, ArrowRight, BookOpen, CheckSquare, Globe } from "lucide-react";

const scoreItems = [
  { label: "Steps to Reproduce", score: 100, color: "#10B981" },
  { label: "WCAG Criterion Cited", score: 95, color: "#8B5CF6" },
  { label: "Environment Details", score: 88, color: "#06B6D4" },
  { label: "Fix Suggestion", score: 80, color: "#F59E0B" }
];

const links = [
  { icon: BookOpen, label: "See report examples", color: "#8B5CF6", href: "/wcag-bug-report-examples" },
  { icon: Globe, label: "WCAG 2.2 hub", color: "#06B6D4", href: "/wcag" },
  { icon: CheckSquare, label: "QA checklists", color: "#10B981", href: "/checklists" }
];

export function FeatureSpotlight() {
  return (
    <section id="templates" className="relative py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div
          className="relative overflow-hidden rounded-3xl"
          style={{
            background: "linear-gradient(135deg, #151A21 0%, #0F1419 60%, #0D1117 100%)",
            border: "1px solid rgba(255,255,255,0.07)",
            boxShadow: "0 0 80px rgba(139,92,246,0.08)"
          }}
        >
          <div
            className="pointer-events-none absolute right-0 top-0 h-[400px] w-[500px]"
            style={{ background: "radial-gradient(ellipse at top right, rgba(139,92,246,0.12) 0%, transparent 70%)" }}
          />
          <div
            className="pointer-events-none absolute bottom-0 left-0 h-[300px] w-[400px]"
            style={{ background: "radial-gradient(ellipse at bottom left, rgba(6,182,212,0.08) 0%, transparent 70%)" }}
          />

          <div className="relative grid items-center gap-12 p-8 md:p-12 lg:grid-cols-2">
            <div>
              <div className="mb-6 flex items-center gap-2.5">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-xl"
                  style={{
                    background: "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(6,182,212,0.1))",
                    border: "1px solid rgba(139,92,246,0.25)"
                  }}
                >
                  <Award size={17} className="text-[#A78BFA]" />
                </div>
                <span className="uppercase tracking-widest" style={{ fontSize: "11px", color: "#A78BFA", fontWeight: 600, letterSpacing: "0.12em" }}>
                  Feature spotlight
                </span>
              </div>

              <h2
                className="mb-5"
                style={{ fontSize: "clamp(26px, 3.5vw, 38px)", fontWeight: 700, color: "#F4F4F5", letterSpacing: "-0.025em", lineHeight: 1.2 }}
              >
                Bug Report{" "}
                <span
                  style={{
                    background: "linear-gradient(135deg, #A78BFA, #06B6D4)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text"
                  }}
                >
                  Quality Score
                </span>
              </h2>

              <p className="mb-6" style={{ fontSize: "15px", color: "#8B9BB4", lineHeight: 1.75, maxWidth: "420px" }}>
                Every report gets an instant quality score based on completeness, WCAG alignment, and reproducibility. Catch weak spots before you file — and get suggestions to improve.
              </p>

              <p className="mb-8" style={{ fontSize: "14px", color: "#4A5568", lineHeight: 1.7 }}>
                The validation engine checks 12 quality dimensions including criterion specificity, environment detail, step clarity, and whether a fix suggestion is provided.
              </p>

              <div className="flex flex-wrap gap-3">
                {links.map(({ icon: Icon, label, color, href }) => (
                  <Link
                    key={label}
                    href={href}
                    className="group flex items-center gap-2 rounded-lg px-4 py-2 transition-all duration-200"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
                  >
                    <Icon size={13} style={{ color }} />
                    <span style={{ fontSize: "13px", color: "#8B9BB4" }} className="transition-colors group-hover:text-white">
                      {label}
                    </span>
                    <ArrowRight size={11} className="text-[#4A5568] transition-transform group-hover:translate-x-0.5" />
                  </Link>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div
                className="mb-6 flex items-center gap-6 rounded-2xl p-5"
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
              >
                <div className="relative h-20 w-20 shrink-0">
                  <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90">
                    <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                    <circle
                      cx="40"
                      cy="40"
                      r="34"
                      fill="none"
                      stroke="url(#scoreGrad)"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 34 * 0.91} ${2 * Math.PI * 34}`}
                    />
                    <defs>
                      <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#8B5CF6" />
                        <stop offset="100%" stopColor="#06B6D4" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span style={{ fontSize: "20px", fontWeight: 700, color: "#F4F4F5", lineHeight: 1 }}>91</span>
                    <span style={{ fontSize: "9px", color: "#4A5568" }}>/ 100</span>
                  </div>
                </div>
                <div>
                  <p style={{ fontSize: "15px", fontWeight: 600, color: "#F4F4F5", marginBottom: "4px" }}>Excellent report quality</p>
                  <p style={{ fontSize: "13px", color: "#8B9BB4" }}>2 improvements available</p>
                  <div className="mt-3 flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-[#10B981]" />
                    <span style={{ fontSize: "11px", color: "#10B981" }}>WCAG compliant</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {scoreItems.map(({ label, score, color }) => (
                  <div key={label} className="flex items-center gap-4">
                    <span className="w-44 shrink-0" style={{ fontSize: "12px", color: "#8B9BB4" }}>
                      {label}
                    </span>
                    <div className="h-1.5 flex-1 rounded-full" style={{ background: "rgba(255,255,255,0.05)" }}>
                      <div className="h-1.5 rounded-full transition-all" style={{ width: `${score}%`, background: `linear-gradient(90deg, ${color}80, ${color})` }} />
                    </div>
                    <span className="w-8 text-right" style={{ fontSize: "11px", color }}>
                      {score}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
