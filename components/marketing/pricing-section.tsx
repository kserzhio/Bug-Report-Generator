"use client";

import { Check, Zap } from "lucide-react";
import { useRouter } from "next/navigation";

type PricingPlan = {
  name: string;
  price: string;
  period: string;
  description: string;
  cta: string;
  ctaVariant: "secondary" | "primary";
  featured?: boolean;
  badge?: string;
  features: string[];
  limitations?: string[];
};

const plans: PricingPlan[] = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for solo testers and getting started.",
    cta: "Get started free",
    ctaVariant: "secondary",
    features: [
      "50 report generations / month",
      "15 pre-built templates",
      "WCAG 2.1 criterion mapping",
      "Quality score validation",
      "Markdown export",
      "1 project"
    ],
    limitations: ["No custom templates", "No Jira / ADO integration", "Community support only"]
  },
  {
    name: "Pro",
    price: "$19",
    period: "per user / month",
    description: "For QA teams that ship accessibility at scale.",
    cta: "Start Pro trial",
    ctaVariant: "primary",
    featured: true,
    badge: "Most popular",
    features: [
      "Unlimited report generations",
      "30+ templates (+ custom templates)",
      "WCAG 2.1 & 2.2 full mapping",
      "Advanced quality scoring",
      "Export to Jira, ADO, GitHub, Linear",
      "Component library integration",
      "Fix suggestions with code",
      "Unlimited projects",
      "Priority support + Slack",
      "API access"
    ]
  }
];

export function PricingSection() {
  const router = useRouter();

  return (
    <section className="relative py-24" id="pricing">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[400px] w-[800px] -translate-x-1/2 -translate-y-1/2"
        style={{
          background: "radial-gradient(ellipse, rgba(139,92,246,0.06) 0%, transparent 70%)",
          filter: "blur(40px)"
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <p
            className="mb-3 uppercase tracking-widest"
            style={{ fontSize: "11px", color: "#4A5568", fontWeight: 600, letterSpacing: "0.15em" }}
          >
            Pricing
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
            Simple,{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #8B5CF6, #06B6D4)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text"
              }}
            >
              transparent
            </span>{" "}
            pricing
          </h2>
          <p
            className="mt-4"
            style={{ fontSize: "16px", color: "#8B9BB4", maxWidth: "400px", margin: "12px auto 0" }}
          >
            Start free. Upgrade when your team needs more power.
          </p>
        </div>

        <div className="mx-auto grid max-w-3xl gap-5 md:grid-cols-2">
          {plans.map(
            ({ name, price, period, description, cta, ctaVariant, features, limitations, featured, badge }) => (
              <div
                key={name}
                className="relative flex flex-col rounded-2xl p-7"
                style={{
                  background: featured
                    ? "linear-gradient(135deg, #1A1429 0%, #131823 100%)"
                    : "linear-gradient(135deg, #151A21 0%, #0F1419 100%)",
                  border: featured ? "1px solid rgba(139,92,246,0.3)" : "1px solid rgba(255,255,255,0.06)",
                  boxShadow: featured ? "0 0 40px rgba(139,92,246,0.1)" : "none"
                }}
              >
                {featured && (
                  <div
                    aria-hidden
                    className="absolute left-8 right-8 top-0 h-px"
                    style={{ background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.6), transparent)" }}
                  />
                )}

                {badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span
                      className="flex items-center gap-1.5 rounded-full px-3 py-1"
                      style={{
                        fontSize: "11px",
                        fontWeight: 600,
                        color: "#A78BFA",
                        background: "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(6,182,212,0.1))",
                        border: "1px solid rgba(139,92,246,0.3)"
                      }}
                    >
                      <Zap size={10} />
                      {badge}
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <p
                    className="mb-3"
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: featured ? "#A78BFA" : "#8B9BB4",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em"
                    }}
                  >
                    {name}
                  </p>
                  <div className="mb-2 flex items-baseline gap-1.5">
                    <span
                      style={{
                        fontSize: "40px",
                        fontWeight: 700,
                        color: "#F4F4F5",
                        letterSpacing: "-0.03em",
                        lineHeight: 1
                      }}
                    >
                      {price}
                    </span>
                    {price !== "$0" && <span style={{ fontSize: "13px", color: "#8B9BB4" }}>/ {period}</span>}
                    {price === "$0" && <span style={{ fontSize: "13px", color: "#8B9BB4" }}>{period}</span>}
                  </div>
                  <p style={{ fontSize: "13px", color: "#8B9BB4", lineHeight: 1.5 }}>{description}</p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      ctaVariant === "primary"
                        ? "/sign-in?next=%2Fdashboard%2Fbilling"
                        : "/sign-up?next=%2Fdashboard%2Fgenerator"
                    )
                  }
                  className="group relative mb-7 w-full overflow-hidden rounded-xl py-3 transition-all duration-200"
                  style={
                    ctaVariant === "primary"
                      ? {
                          fontSize: "14px",
                          fontWeight: 600,
                          color: "#fff",
                          background: "linear-gradient(135deg, #7C3AED 0%, #6366F1 100%)",
                          boxShadow: "0 0 24px rgba(139,92,246,0.3)"
                        }
                      : {
                          fontSize: "14px",
                          fontWeight: 500,
                          color: "#8B9BB4",
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.08)"
                        }
                  }
                >
                  {ctaVariant === "primary" && (
                    <div
                      aria-hidden
                      className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      style={{ background: "linear-gradient(135deg, #6D28D9 0%, #4F46E5 100%)" }}
                    />
                  )}
                  <span className="relative z-10">{cta}</span>
                </button>

                <div className="flex-1 space-y-2.5">
                  {features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <div
                        className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full"
                        style={{ background: featured ? "rgba(139,92,246,0.15)" : "rgba(16,185,129,0.1)" }}
                      >
                        <Check size={9} style={{ color: featured ? "#A78BFA" : "#10B981" }} />
                      </div>
                      <span style={{ fontSize: "13px", color: "#C4CDD6", lineHeight: 1.5 }}>{feature}</span>
                    </div>
                  ))}
                  {limitations?.map((feature) => (
                    <div key={feature} className="flex items-start gap-3 opacity-40">
                      <div
                        className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full"
                        style={{ background: "rgba(255,255,255,0.05)" }}
                      >
                        <div className="h-px w-1.5 bg-[#8B9BB4]" />
                      </div>
                      <span style={{ fontSize: "13px", color: "#8B9BB4", lineHeight: 1.5 }}>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}
        </div>

        <p className="mt-8 text-center" style={{ fontSize: "13px", color: "#4A5568" }}>
          All plans include a 14-day Pro trial. No credit card required.
        </p>
      </div>
    </section>
  );
}
