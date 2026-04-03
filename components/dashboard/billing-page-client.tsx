"use client";

import { useState, useTransition } from "react";
import {
  BarChart3,
  BookMarked,
  Check,
  ChevronRight,
  CreditCard,
  Crown,
  Download,
  Infinity,
  Lock,
  Shield,
  Sparkles,
  Users,
  Zap
} from "lucide-react";

import { notifyError, notifyInfo, notifyWarning } from "@/lib/ui/toast-policy";
import { createStripeCheckoutAction, createStripePortalAction } from "@/src/server/actions/dashboard-actions";

type BillingCycle = "monthly" | "yearly";

type InvoiceRow = {
  id: string;
  date: string;
  amount: string;
  status: string;
};

type Copy = {
  proPlan: string;
  active: string;
  nextBillingDate: string;
  manageSubscription: string;
  cancelPlan: string;
  pricingTitle: string;
  pricingSubtitle: string;
  monthly: string;
  yearly: string;
  save: string;
  free: string;
  pro: string;
  perMonth: string;
  freeDesc: string;
  proDesc: string;
  currentPlan: string;
  downgrade: string;
  mostPopular: string;
  currentPlanCta: string;
  processing: string;
  upgradeToPro: string;
  everythingInPro: string;
  paymentMethod: string;
  updatePaymentMethod: string;
  billingHistory: string;
  viewAll: string;
  paid: string;
  yearlyComingSoon: string;
};

type Props = {
  currentPlanId: "free" | "pro";
  periodEnd: string;
  proMonthlyPrice: number;
  yearlyDisplayPrice: number;
  invoices: InvoiceRow[];
  copy: Copy;
};

const freeFeatures = [
  { text: "10 bug reports / month", included: true },
  { text: "Basic templates (5)", included: true },
  { text: "Markdown export", included: true },
  { text: "Community support", included: true },
  { text: "Bug Quality Score", included: false },
  { text: "Unlimited reports", included: false },
  { text: "Full template library", included: false },
  { text: "Reusable bug library", included: false },
  { text: "Project management", included: false },
  { text: "Analytics & insights", included: false },
  { text: "Jira / Linear export", included: false },
  { text: "Priority support", included: false }
];

const proFeatures = [
  { text: "Unlimited bug reports", highlight: true },
  { text: "Full template library (50+)", highlight: true },
  { text: "Markdown + Jira + Linear export" },
  { text: "Priority support" },
  { text: "Bug Quality Score", highlight: true },
  { text: "Reusable bug library", highlight: true },
  { text: "Project management" },
  { text: "Analytics & insights", highlight: true }
];

const proHighlights = [
  { icon: Infinity, label: "Unlimited Reports", desc: "No monthly cap — generate as many bug reports as your workflow demands." },
  { icon: BookMarked, label: "Bug Library", desc: "Save, organize, and reuse your best snippets across every project." },
  { icon: BarChart3, label: "Analytics", desc: "Track quality scores, severity trends, and team output over time." },
  { icon: Shield, label: "WCAG Coverage", desc: "Full WCAG 2.1 + 2.2 template library with level A, AA, and AAA criteria." },
  { icon: Users, label: "Team Projects", desc: "Manage unlimited projects and collaborate with your QA team." },
  { icon: Lock, label: "Priority Support", desc: "24h response guarantee from our accessibility and QA experts." }
];

export function BillingPageClient({
  currentPlanId,
  periodEnd,
  proMonthlyPrice,
  yearlyDisplayPrice,
  invoices,
  copy
}: Props) {
  const [billing, setBilling] = useState<BillingCycle>("monthly");
  const [isUpgradePending, startUpgrade] = useTransition();
  const [isPortalPending, startPortal] = useTransition();

  const isPro = currentPlanId === "pro";
  const displayedPrice = billing === "monthly" ? proMonthlyPrice : yearlyDisplayPrice;
  const yearSaving = (proMonthlyPrice - yearlyDisplayPrice) * 12;

  const openPortal = (intent: "manage" | "cancel") => {
    startPortal(async () => {
      if (intent === "cancel") {
        notifyInfo(copy.cancelPlan);
      }

      const result = await createStripePortalAction();
      if (result.error) {
        notifyError(result.error);
        return;
      }

      if (result.url) {
        window.location.href = result.url;
      }
    });
  };

  const upgradeToPro = () => {
    startUpgrade(async () => {
      if (billing === "yearly") {
        notifyWarning(copy.yearlyComingSoon);
      }

      const result = await createStripeCheckoutAction();
      if (result.error) {
        notifyError(result.error);
        return;
      }

      if (result.url) {
        window.location.href = result.url;
      }
    });
  };

  return (
    <div className="space-y-8">
      <div
        className="relative flex flex-wrap items-center justify-between gap-4 overflow-hidden rounded-2xl p-5"
        style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(6,182,212,0.08) 100%)", border: "1px solid rgba(139,92,246,0.2)" }}
      >
        <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse at 80% 50%, rgba(139,92,246,0.08) 0%, transparent 70%)" }} />
        <div className="relative flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: "rgba(139,92,246,0.2)", border: "1px solid rgba(139,92,246,0.3)" }}>
            <Crown className="h-5 w-5 text-[#A78BFA]" />
          </div>
          <div>
            <div className="mb-0.5 flex items-center gap-2">
              <p className="font-semibold text-white">{isPro ? copy.proPlan : copy.free}</p>
              <span className="rounded-md px-2 py-0.5 text-[10px] font-bold" style={{ background: "rgba(139,92,246,0.2)", color: "#A78BFA", border: "1px solid rgba(139,92,246,0.3)" }}>
                {copy.active}
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              {copy.nextBillingDate}: <span className="text-white">{periodEnd}</span>
              {isPro ? ` · $${proMonthlyPrice}.00${copy.perMonth}` : ""}
            </p>
          </div>
        </div>
        <div className="relative flex items-center gap-3">
          <button
            className="h-9 rounded-lg px-4 text-sm text-zinc-300 transition-all hover:bg-white/10 hover:text-white"
            style={{ border: "1px solid rgba(255,255,255,0.08)" }}
            onClick={() => openPortal("manage")}
            disabled={isPortalPending}
          >
            {isPortalPending ? "..." : copy.manageSubscription}
          </button>
          {isPro ? (
            <button
              className="h-9 rounded-lg px-4 text-sm text-[#E41F07] transition-all hover:bg-[#E41F07]/10"
              style={{ border: "1px solid rgba(228,31,7,0.2)" }}
              onClick={() => openPortal("cancel")}
              disabled={isPortalPending}
            >
              {copy.cancelPlan}
            </button>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col items-center gap-3">
        <h2 className="text-xl font-bold text-white">{copy.pricingTitle}</h2>
        <p className="text-sm text-zinc-500">{copy.pricingSubtitle}</p>
        <div className="mt-1 flex items-center gap-1 rounded-xl p-1" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
          {(["monthly", "yearly"] as const).map((b) => (
            <button
              key={b}
              onClick={() => setBilling(b)}
              className="relative h-8 rounded-lg px-5 text-sm capitalize transition-all duration-200"
              style={
                billing === b
                  ? { background: "rgba(255,255,255,0.08)", color: "#F4F4F5", border: "1px solid rgba(255,255,255,0.1)" }
                  : { color: "#71717A" }
              }
            >
              {b === "monthly" ? copy.monthly : copy.yearly}
              {b === "yearly" ? (
                <span className="ml-2 rounded px-1.5 py-0.5 text-[9px] font-bold" style={{ background: "rgba(34,197,94,0.15)", color: "#22C55E" }}>
                  {copy.save} ${yearSaving}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-4xl grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="relative flex flex-col gap-5 rounded-2xl p-6" style={{ background: "#151A21", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div>
            <div className="mb-1 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-zinc-400" />
                <span className="text-sm font-semibold text-white">{copy.free}</span>
              </div>
              {currentPlanId === "free" ? (
                <span className="rounded border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-bold text-zinc-400">{copy.currentPlan}</span>
              ) : null}
            </div>
            <div className="mb-1 mt-3 flex items-end gap-1.5">
              <span className="text-4xl font-bold text-white">$0</span>
              <span className="mb-1.5 text-sm text-zinc-500">{copy.perMonth}</span>
            </div>
            <p className="text-xs text-zinc-500">{copy.freeDesc}</p>
          </div>

          <div className="h-px bg-white/5" />

          <div className="flex-1 space-y-2.5">
            {freeFeatures.map((feature) => (
              <div key={feature.text} className="flex items-center gap-2.5">
                {feature.included ? <Check className="h-3.5 w-3.5 shrink-0 text-[#10B981]" /> : <div className="flex h-3.5 w-3.5 shrink-0 items-center justify-center"><div className="h-px w-3 rounded bg-zinc-700" /></div>}
                <span className={`text-xs ${feature.included ? "text-zinc-300" : "text-zinc-600"}`}>{feature.text}</span>
              </div>
            ))}
          </div>

          <button
            className="h-10 w-full rounded-xl text-sm font-semibold transition-all"
            style={{ background: "rgba(255,255,255,0.05)", color: "#A1A1AA", border: "1px solid rgba(255,255,255,0.08)", cursor: currentPlanId === "free" ? "default" : "pointer" }}
            disabled={currentPlanId === "free"}
          >
            {currentPlanId === "free" ? copy.currentPlanCta : copy.downgrade}
          </button>
        </div>

        <div
          className="relative flex flex-col gap-5 overflow-hidden rounded-2xl p-6"
          style={{ background: "linear-gradient(145deg, #1A1226 0%, #151A21 60%)", border: "1px solid rgba(139,92,246,0.3)", boxShadow: "0 0 40px rgba(139,92,246,0.08), 0 8px 32px rgba(0,0,0,0.4)" }}
        >
          <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full" style={{ background: "radial-gradient(ellipse, rgba(139,92,246,0.12) 0%, transparent 70%)", transform: "translate(20%, -20%)" }} />
          <div className="absolute right-5 top-5">
            <span className="flex items-center gap-1 rounded-md px-2.5 py-1 text-[10px] font-bold" style={{ background: "rgba(228,31,7,0.15)", color: "#E41F07", border: "1px solid rgba(228,31,7,0.25)" }}>
              <Sparkles className="h-2.5 w-2.5" />
              {copy.mostPopular}
            </span>
          </div>

          <div className="relative">
            <div className="mb-1 flex items-center gap-2">
              <Crown className="h-4 w-4 text-[#A78BFA]" />
              <span className="text-sm font-semibold text-white">{copy.pro}</span>
              {currentPlanId === "pro" ? (
                <span className="rounded border border-purple-400/30 bg-purple-500/20 px-2 py-0.5 text-[10px] font-bold text-[#A78BFA]">{copy.active}</span>
              ) : null}
            </div>
            <div className="mb-1 mt-3 flex items-end gap-1.5">
              <span className="text-4xl font-bold text-white">${displayedPrice}</span>
              <span className="mb-1.5 text-sm text-zinc-500">{copy.perMonth}</span>
              {billing === "yearly" ? <span className="mb-1.5 ml-1 text-xs text-zinc-500 line-through">${proMonthlyPrice}</span> : null}
            </div>
            <p className="text-xs text-zinc-500">{copy.proDesc}</p>
          </div>

          <div className="h-px" style={{ background: "rgba(139,92,246,0.15)" }} />

          <div className="relative flex-1 space-y-2.5">
            {proFeatures.map((feature) => (
              <div key={feature.text} className="flex items-center gap-2.5">
                <Check className="h-3.5 w-3.5 shrink-0" style={{ color: feature.highlight ? "#A78BFA" : "#10B981" }} />
                <span className={`text-xs ${feature.highlight ? "font-medium text-white" : "text-zinc-300"}`}>{feature.text}</span>
              </div>
            ))}
          </div>

          <button
            onClick={upgradeToPro}
            disabled={currentPlanId === "pro" || isUpgradePending}
            className="group relative flex h-11 w-full items-center justify-center gap-2 overflow-hidden rounded-xl text-sm font-bold text-white transition-all duration-200"
            style={{
              background: currentPlanId === "pro" ? "rgba(139,92,246,0.15)" : "linear-gradient(135deg, #8B5CF6, #6D28D9)",
              border: currentPlanId === "pro" ? "1px solid rgba(139,92,246,0.3)" : "none",
              boxShadow: currentPlanId === "pro" ? "none" : "0 4px 20px rgba(139,92,246,0.35)",
              cursor: currentPlanId === "pro" ? "default" : "pointer"
            }}
          >
            {currentPlanId === "pro" ? (
              <>
                <Check className="h-4 w-4 text-[#A78BFA]" />
                <span className="text-[#A78BFA]">{copy.currentPlanCta}</span>
              </>
            ) : isUpgradePending ? (
              <span className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                {copy.processing}
              </span>
            ) : (
              <>
                <Zap className="h-4 w-4" />
                {copy.upgradeToPro} · ${displayedPrice}/mo
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </button>
        </div>
      </div>

      <div className="mx-auto w-full max-w-4xl">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-600">{copy.everythingInPro}</p>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {proHighlights.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="flex gap-3 rounded-xl p-4" style={{ background: "#151A21", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.15)" }}>
                <Icon className="h-3.5 w-3.5 text-[#A78BFA]" />
              </div>
              <div>
                <p className="mb-0.5 text-xs font-semibold text-white">{label}</p>
                <p className="text-[11px] leading-relaxed text-zinc-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-4xl grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="rounded-2xl p-5" style={{ background: "#151A21", border: "1px solid rgba(255,255,255,0.08)" }}>
          <h3 className="mb-4 text-sm font-semibold text-white">{copy.paymentMethod}</h3>
          <div className="mb-4 flex items-center gap-3 rounded-xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex h-6 w-9 items-center justify-center rounded" style={{ background: "linear-gradient(135deg, #1A56DB, #0EA5E9)" }}>
              <span className="text-[8px] font-extrabold tracking-[0.05em] text-white">VISA</span>
            </div>
            <div className="flex-1">
              <p className="text-xs text-white">•••• •••• •••• 4242</p>
              <p className="text-[10px] text-zinc-500">Expires 08 / 2027</p>
            </div>
            <button className="text-[10px] text-zinc-500 transition-colors hover:text-white">Edit</button>
          </div>
          <button
            className="flex h-9 w-full items-center justify-center gap-2 rounded-lg text-xs text-zinc-400 transition-all hover:bg-white/5 hover:text-white"
            style={{ border: "1px solid rgba(255,255,255,0.07)" }}
            onClick={() => openPortal("manage")}
          >
            <CreditCard className="h-3.5 w-3.5" />
            {copy.updatePaymentMethod}
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl lg:col-span-2" style={{ background: "#151A21", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
            <h3 className="text-sm font-semibold text-white">{copy.billingHistory}</h3>
            <button className="text-xs text-zinc-500 transition-colors hover:text-white">{copy.viewAll}</button>
          </div>
          <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
            {invoices.map((invoice) => (
              <div key={invoice.id} className="group flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.15)" }}>
                    <Check className="h-3.5 w-3.5 text-[#22C55E]" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-white">{invoice.id}</p>
                    <p className="text-[10px] text-zinc-600">{invoice.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-white">{invoice.amount}</span>
                  <span className="rounded border border-green-400/20 bg-green-500/10 px-2 py-0.5 text-[9px] font-semibold text-green-400">{invoice.status || copy.paid}</span>
                  <button className="flex h-7 w-7 items-center justify-center rounded-md opacity-0 transition-all group-hover:opacity-100 hover:bg-white/10">
                    <Download className="h-3.5 w-3.5 text-zinc-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
