"use client";

import { ArrowRight, Shield } from "lucide-react";
import { useRouter } from "next/navigation";

export function FinalCTA() {
  const router = useRouter();

  return (
    <section className="relative overflow-hidden py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div
          className="relative overflow-hidden rounded-3xl px-8 py-20 text-center"
          style={{
            background: "linear-gradient(135deg, #0F0D1A 0%, #0D1117 50%, #0B1520 100%)",
            border: "1px solid rgba(255,255,255,0.07)"
          }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-0 h-[300px] w-[600px] -translate-x-1/2"
            style={{ background: "radial-gradient(ellipse at top, rgba(139,92,246,0.18) 0%, transparent 70%)" }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-0 left-1/4 h-[200px] w-[400px]"
            style={{ background: "radial-gradient(ellipse at bottom, rgba(6,182,212,0.1) 0%, transparent 70%)" }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-0 right-1/4 h-[200px] w-[400px]"
            style={{ background: "radial-gradient(ellipse at bottom, rgba(228,31,7,0.08) 0%, transparent 70%)" }}
          />

          <div
            aria-hidden
            className="absolute left-16 right-16 top-0 h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(139,92,246,0.5), rgba(6,182,212,0.3), transparent)"
            }}
          />

          <div className="relative">
            <div
              className="mb-8 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5"
              style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)" }}
            >
              <Shield size={11} className="text-[#A78BFA]" />
              <span style={{ fontSize: "12px", color: "#A78BFA", fontWeight: 500 }}>
                WCAG-native · No setup required
              </span>
            </div>

            <h2
              className="mx-auto mb-5"
              style={{
                fontSize: "clamp(30px, 4.5vw, 52px)",
                fontWeight: 700,
                color: "#F4F4F5",
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
                maxWidth: "680px"
              }}
            >
              Start writing better accessibility bugs{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #8B5CF6 0%, #06B6D4 50%, #10B981 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text"
                }}
              >
                today.
              </span>
            </h2>

            <p
              className="mx-auto mb-10"
              style={{ fontSize: "17px", color: "#8B9BB4", lineHeight: 1.7, maxWidth: "480px" }}
            >
              Join 2,400+ QA engineers already filing cleaner, faster, more actionable accessibility reports. Free
              plan, no credit card required.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => router.push("/sign-up?next=%2Fdashboard%2Fgenerator")}
                className="group relative flex items-center gap-2.5 overflow-hidden rounded-xl px-8 py-3.5 text-white transition-all duration-200"
                style={{
                  fontSize: "15px",
                  fontWeight: 600,
                  background: "linear-gradient(135deg, #E41F07 0%, #FF4520 100%)",
                  boxShadow: "0 0 40px rgba(228,31,7,0.45), 0 4px 20px rgba(228,31,7,0.25)"
                }}
              >
                <span className="relative z-10">Start free - no card needed</span>
                <ArrowRight size={16} className="relative z-10 transition-transform group-hover:translate-x-0.5" />
                <div
                  aria-hidden
                  className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{ background: "linear-gradient(135deg, #FF4520 0%, #E41F07 100%)" }}
                />
              </button>
            </div>

            <p className="mt-6" style={{ fontSize: "13px", color: "#4A5568" }}>
              14-day Pro trial included · Cancel anytime · GDPR compliant
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
