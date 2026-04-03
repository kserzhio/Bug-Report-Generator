import type { BillingPlanId } from "@/lib/billing/plans";
import type { Locale } from "@/lib/i18n/locale";

const NAMES: Record<Locale, Record<BillingPlanId, string>> = {
  en: {
    free: "Free",
    pro: "Pro"
  },
  uk: {
    free: "Безкоштовний",
    pro: "Pro"
  }
};

const FEATURES: Record<Locale, Record<BillingPlanId, string[]>> = {
  en: {
    free: [
      "20 bug generations per month",
      "Saved history",
      "Default accessibility templates"
    ],
    pro: [
      "Unlimited generations",
      "Markdown export",
      "Custom templates",
      "Priority support"
    ]
  },
  uk: {
    free: [
      "20 генерацій багів на місяць",
      "Збережена історія",
      "Базові шаблони доступності"
    ],
    pro: [
      "Безлімітні генерації",
      "Експорт Markdown",
      "Кастомні шаблони",
      "Пріоритетна підтримка"
    ]
  }
};

export function getLocalizedPlanName(planId: BillingPlanId, locale: Locale) {
  return NAMES[locale]?.[planId] ?? NAMES.en[planId];
}

export function getLocalizedPlanFeatures(planId: BillingPlanId, locale: Locale) {
  return FEATURES[locale]?.[planId] ?? FEATURES.en[planId];
}
