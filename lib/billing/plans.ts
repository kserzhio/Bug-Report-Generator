export const BILLING_PLANS = {
  free: {
    id: "free",
    name: "Free",
    priceMonthly: 0,
    generationLimit: 20,
    features: [
      "20 bug generations per month",
      "Saved history",
      "Default accessibility templates"
    ]
  },
  pro: {
    id: "pro",
    name: "Pro",
    priceMonthly: 19,
    generationLimit: null,
    features: [
      "Unlimited generations",
      "Markdown export",
      "Custom templates",
      "Priority support"
    ]
  }
} as const;

export type BillingPlanId = keyof typeof BILLING_PLANS;
