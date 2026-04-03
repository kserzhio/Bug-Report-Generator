"use client";

import { ArrowRight, Zap, Eye, Shield, CheckCircle2, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

function BugReportPreview() {
  return (
    <div
      className="relative overflow-hidden rounded-2xl"
      style={{
        background: "linear-gradient(135deg, #151A21 0%, #0D1117 100%)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 0 60px rgba(139,92,246,0.12), 0 0 120px rgba(6,182,212,0.06), 0 40px 80px rgba(0,0,0,0.5)"
      }}
    >
      <div className="flex items-center gap-2 border-b border-white/5 px-4 py-3">
        <div className="h-3 w-3 rounded-full bg-[#FF5F57]" />
        <div className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
        <div className="h-3 w-3 rounded-full bg-[#28C840]" />
        <div className="mx-4 flex-1">
          <div
            className="flex h-5 items-center gap-2 rounded-md px-3"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="h-1.5 w-1.5 rounded-full bg-[#8B9BB4]" />
            <span style={{ fontSize: "11px", color: "#4A5568" }}>bugwriter.app / report / new</span>
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <div className="mb-1.5 flex items-center gap-2">
              <span
                className="rounded px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider"
                style={{ background: "rgba(228,31,7,0.15)", color: "#E41F07", border: "1px solid rgba(228,31,7,0.2)" }}
              >
                Critical
              </span>
              <span
                className="rounded px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider"
                style={{ background: "rgba(6,182,212,0.1)", color: "#06B6D4", border: "1px solid rgba(6,182,212,0.15)" }}
              >
                Accessibility
              </span>
            </div>
            <h3 style={{ fontSize: "13px", fontWeight: 600, color: "#F4F4F5", lineHeight: 1.4 }}>
              Focus indicator missing on Login button
            </h3>
          </div>
          <div
            className="flex items-center gap-1.5 rounded-md px-2 py-1"
            style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.15)" }}
          >
            <div className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
            <span style={{ fontSize: "10px", color: "#10B981" }}>Score 94</span>
          </div>
        </div>

        <div
          className="mb-4 flex items-center gap-2 rounded-lg p-2.5"
          style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.12)" }}
        >
          <Shield size={12} className="shrink-0 text-[#8B5CF6]" />
          <span style={{ fontSize: "11px", color: "#A78BFA" }}>WCAG 2.1 AA · 2.4.7 Focus Visible · Keyboard Navigation</span>
        </div>

        {[
          { label: "Component", value: "LoginButton.tsx · line 47" },
          { label: "Environment", value: "Chrome 121 · macOS 14.2" }
        ].map((field) => (
          <div key={field.label} className="mb-2.5 flex items-center gap-3">
            <span style={{ fontSize: "10px", color: "#4A5568", width: "72px", flexShrink: 0 }}>{field.label}</span>
            <span style={{ fontSize: "11px", color: "#8B9BB4" }}>{field.value}</span>
          </div>
        ))}

        <div className="my-3 border-t border-white/5" />

        <div className="space-y-3">
          <div className="rounded-lg p-3" style={{ background: "rgba(228,31,7,0.05)", border: "1px solid rgba(228,31,7,0.08)" }}>
            <p style={{ fontSize: "10px", color: "#E41F07", marginBottom: "4px", fontWeight: 500 }}>Actual Behavior</p>
            <p style={{ fontSize: "11px", color: "#8B9BB4", lineHeight: 1.5 }}>Login button has no visible focus ring on keyboard navigation. Focus outline: none applied globally.</p>
          </div>
          <div className="rounded-lg p-3" style={{ background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.08)" }}>
            <p style={{ fontSize: "10px", color: "#10B981", marginBottom: "4px", fontWeight: 500 }}>Expected Behavior</p>
            <p style={{ fontSize: "11px", color: "#8B9BB4", lineHeight: 1.5 }}>Visible focus indicator (2px outline, offset 2px) should appear on all interactive elements.</p>
          </div>
        </div>

        <div className="mt-3 rounded-lg p-3" style={{ background: "#0D1117", border: "1px solid rgba(255,255,255,0.06)" }}>
          <p style={{ fontSize: "10px", color: "#4A5568", marginBottom: "6px" }}>Suggested Fix</p>
          <pre style={{ fontSize: "10px", color: "#A78BFA", fontFamily: "monospace", lineHeight: 1.6 }}>{`.btn:focus-visible {\n  outline: 2px solid #6366F1;\n  outline-offset: 2px;\n}`}</pre>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500">
              <span style={{ fontSize: "8px", color: "white", fontWeight: 700 }}>JD</span>
            </div>
            <span style={{ fontSize: "10px", color: "#4A5568" }}>Generated just now</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button className="rounded px-2.5 py-1 text-[10px]" style={{ background: "rgba(255,255,255,0.04)", color: "#8B9BB4", border: "1px solid rgba(255,255,255,0.06)" }}>
              Copy
            </button>
            <button className="rounded px-2.5 py-1 text-[10px]" style={{ background: "rgba(228,31,7,0.12)", color: "#E41F07", border: "1px solid rgba(228,31,7,0.15)" }}>
              Export
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LandingHero() {
  const router = useRouter();
  const benefits = [
    { icon: Zap, label: "Structured output" },
    { icon: Eye, label: "Live preview" },
    { icon: Shield, label: "Accessibility-focused" }
  ];

  return (
    <section className="relative flex min-h-screen items-center overflow-hidden pt-16">
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute left-1/4 top-0 h-[600px] w-[600px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #8B5CF6 0%, transparent 70%)", filter: "blur(80px)" }}
        />
        <div
          className="absolute right-0 top-1/3 h-[500px] w-[500px] rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, #06B6D4 0%, transparent 70%)", filter: "blur(80px)" }}
        />
        <div
          className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #E41F07 0%, transparent 70%)", filter: "blur(80px)" }}
        />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px"
          }}
        />
      </div>

      <div className="mx-auto w-full max-w-7xl px-6 py-24">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <div>
            <div
              className="mb-8 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5"
              style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)" }}
            >
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#8B5CF6]" />
              <span style={{ fontSize: "12px", color: "#A78BFA", fontWeight: 500 }}>WCAG-aware bug reporting tool</span>
            </div>

            <h1
              className="mb-6"
              style={{
                fontSize: "clamp(36px, 5vw, 56px)",
                fontWeight: 700,
                lineHeight: 1.1,
                letterSpacing: "-0.03em",
                color: "#F4F4F5"
              }}
            >
              Write polished{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #8B5CF6 0%, #06B6D4 50%, #10B981 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text"
                }}
              >
                accessibility bug reports
              </span>{" "}
              in minutes, not hours.
            </h1>

            <p className="mb-8 max-w-lg" style={{ fontSize: "17px", color: "#8B9BB4", lineHeight: 1.7 }}>
              Structured templates, WCAG-aware fields, and a real-time preview panel. Generate professional bug reports that developers actually act on.
            </p>

            <div className="mb-10 flex flex-wrap items-center gap-3">
              <button
                onClick={() => router.push("/sign-up?next=%2Fdashboard%2Fgenerator")}
                className="group relative flex items-center gap-2 overflow-hidden rounded-lg px-6 py-3 text-white transition-all duration-200"
                style={{
                  fontSize: "15px",
                  fontWeight: 600,
                  background: "linear-gradient(135deg, #E41F07 0%, #FF4520 100%)",
                  boxShadow: "0 0 30px rgba(228,31,7,0.4), 0 4px 15px rgba(228,31,7,0.2)"
                }}
              >
                <span>Start free</span>
                <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                <div
                  className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{ background: "linear-gradient(135deg, #FF4520 0%, #E41F07 100%)" }}
                />
              </button>

              <a
                href="#pricing"
                className="group flex items-center gap-2 rounded-lg px-6 py-3 transition-all duration-200"
                style={{ fontSize: "15px", fontWeight: 500, color: "#8B9BB4", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <span className="transition-colors group-hover:text-white">View pricing</span>
                <ChevronRight size={14} className="text-[#4A5568] transition-colors group-hover:text-white" />
              </a>
            </div>

            <div className="flex flex-wrap gap-4">
              {benefits.map(({ label }) => (
                <div key={label} className="flex items-center gap-2">
                  <div
                    className="flex h-5 w-5 items-center justify-center rounded-full"
                    style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}
                  >
                    <CheckCircle2 size={11} className="text-[#10B981]" />
                  </div>
                  <span style={{ fontSize: "13px", color: "#8B9BB4" }}>{label}</span>
                </div>
              ))}
            </div>

            <div className="mt-10 flex items-center gap-6 border-t border-white/5 pt-8">
              <div>
                <p style={{ fontSize: "22px", fontWeight: 700, color: "#F4F4F5", lineHeight: 1 }}>2,400+</p>
                <p style={{ fontSize: "12px", color: "#4A5568", marginTop: "4px" }}>QA engineers</p>
              </div>
              <div className="h-8 w-px bg-white/5" />
              <div>
                <p style={{ fontSize: "22px", fontWeight: 700, color: "#F4F4F5", lineHeight: 1 }}>48k+</p>
                <p style={{ fontSize: "12px", color: "#4A5568", marginTop: "4px" }}>Reports generated</p>
              </div>
              <div className="h-8 w-px bg-white/5" />
              <div>
                <p style={{ fontSize: "22px", fontWeight: 700, color: "#F4F4F5", lineHeight: 1 }}>98%</p>
                <p style={{ fontSize: "12px", color: "#4A5568", marginTop: "4px" }}>WCAG accuracy</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative z-10">
              <BugReportPreview />
            </div>
            <div
              className="absolute -bottom-6 -left-6 z-20 w-48 rounded-xl p-3"
              style={{
                background: "rgba(21,26,33,0.9)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.4)"
              }}
            >
              <div className="mb-1.5 flex items-center gap-2">
                <div className="h-2 w-2 animate-pulse rounded-full bg-[#10B981]" />
                <span style={{ fontSize: "11px", color: "#10B981", fontWeight: 500 }}>Report exported</span>
              </div>
              <p style={{ fontSize: "10px", color: "#4A5568" }}>Jira ticket BUG-2847 created</p>
            </div>
            <div
              className="absolute -right-4 -top-4 z-20 w-44 rounded-xl p-3"
              style={{
                background: "rgba(21,26,33,0.9)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(139,92,246,0.15)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.4)"
              }}
            >
              <div className="mb-1 flex items-center gap-2">
                <Shield size={10} className="text-[#8B5CF6]" />
                <span style={{ fontSize: "10px", color: "#8B5CF6", fontWeight: 500 }}>WCAG 2.1 AA</span>
              </div>
              <div className="mt-1 flex items-center gap-1">
                <div className="h-1.5 flex-1 rounded-full" style={{ background: "rgba(255,255,255,0.05)" }}>
                  <div className="h-1.5 w-[94%] rounded-full" style={{ background: "linear-gradient(90deg, #8B5CF6, #06B6D4)" }} />
                </div>
                <span style={{ fontSize: "10px", color: "#A78BFA" }}>94%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
