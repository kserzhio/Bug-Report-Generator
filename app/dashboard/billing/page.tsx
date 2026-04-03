import { BillingCheckoutToast } from "@/components/dashboard/billing-checkout-toast";
import { BillingPageClient } from "@/components/dashboard/billing-page-client";
import { BILLING_PLANS } from "@/lib/billing/plans";
import { getMessages } from "@/lib/i18n/messages";
import { normalizeLocale } from "@/lib/i18n/locale";
import { getCurrentWorkspaceContext } from "@/src/server/queries/workspace";

function monthShift(base: Date, monthsBack: number) {
  return new Date(base.getFullYear(), base.getMonth() - monthsBack, 1);
}

export default async function BillingPage({
  searchParams
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const context = await getCurrentWorkspaceContext();
  await searchParams;

  const locale = normalizeLocale(context.workspace.uiLocale);
  const t = getMessages(locale);

  const currentPlanId = context.plan.id === "pro" ? "pro" : "free";
  const proMonthlyPrice = BILLING_PLANS.pro.priceMonthly;
  const yearlyDisplayPrice = 15;

  const periodEnd = context.subscription?.currentPeriodEnd
    ? context.subscription.currentPeriodEnd.toLocaleDateString(locale === "uk" ? "uk-UA" : "en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
      })
    : locale === "uk"
      ? "Not set"
      : "Not set";

  const invoices = Array.from({ length: 4 }, (_, index) => {
    const date = monthShift(new Date(), index);
    return {
      id: `INV-${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
      date: date.toLocaleDateString(locale === "uk" ? "uk-UA" : "en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
      }),
      amount: currentPlanId === "pro" ? `$${proMonthlyPrice}.00` : "$0.00",
      status: locale === "uk" ? "Paid" : "Paid"
    };
  });

  const copy =
    locale === "uk"
      ? {
          proPlan: "Pro Plan",
          active: "ACTIVE",
          nextBillingDate: "Наступне списання",
          manageSubscription: "Керувати підпискою",
          cancelPlan: "Скасувати план",
          pricingTitle: "Simple, transparent pricing",
          pricingSubtitle: "Start free. Upgrade when you need more power.",
          monthly: "monthly",
          yearly: "yearly",
          save: "Save",
          free: "Free",
          pro: "Pro",
          perMonth: "/month",
          freeDesc: "Perfect for occasional QA tasks and trying out the tool.",
          proDesc: "Everything you need for professional QA work.",
          currentPlan: "CURRENT",
          downgrade: "Downgrade to Free",
          mostPopular: "MOST POPULAR",
          currentPlanCta: "Current Plan",
          processing: "Processing...",
          upgradeToPro: "Upgrade to Pro",
          everythingInPro: "Everything in Pro",
          paymentMethod: "Payment Method",
          updatePaymentMethod: "Update payment method",
          billingHistory: "Billing History",
          viewAll: "View all",
          paid: "Paid",
          yearlyComingSoon: "Yearly billing is coming soon. Opening monthly checkout now."
        }
      : {
          proPlan: "Pro Plan",
          active: "ACTIVE",
          nextBillingDate: "Next billing date",
          manageSubscription: "Manage Subscription",
          cancelPlan: "Cancel Plan",
          pricingTitle: "Simple, transparent pricing",
          pricingSubtitle: "Start free. Upgrade when you need more power.",
          monthly: "monthly",
          yearly: "yearly",
          save: "Save",
          free: "Free",
          pro: "Pro",
          perMonth: "/month",
          freeDesc: "Perfect for occasional QA tasks and trying out the tool.",
          proDesc: "Everything you need for professional QA work.",
          currentPlan: "CURRENT",
          downgrade: "Downgrade to Free",
          mostPopular: "MOST POPULAR",
          currentPlanCta: "Current Plan",
          processing: "Processing...",
          upgradeToPro: "Upgrade to Pro",
          everythingInPro: "Everything in Pro",
          paymentMethod: "Payment Method",
          updatePaymentMethod: "Update payment method",
          billingHistory: "Billing History",
          viewAll: "View all",
          paid: "Paid",
          yearlyComingSoon: "Yearly billing is coming soon. Opening monthly checkout now."
        };

  return (
    <div className="space-y-6">
      <BillingCheckoutToast />
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-white">{t.dashboard.billingTitle}</h1>
        <p className="text-sm text-zinc-400">{t.dashboard.billingSubtitle}</p>
      </div>

      <BillingPageClient
        currentPlanId={currentPlanId}
        periodEnd={periodEnd}
        proMonthlyPrice={proMonthlyPrice}
        yearlyDisplayPrice={yearlyDisplayPrice}
        invoices={invoices}
        copy={copy}
      />
    </div>
  );
}
