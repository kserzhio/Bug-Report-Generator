export type ToastLocale = "uk" | "en";

type GeneratorMessages = {
  exportRequiresPro: string;
  shortNoteRequired: string;
  shortNoteExpanded: string;
  aiUnavailable: string;
  copied: string;
  formReset: string;
  wcagApplied: string;
  reportSavedFallback: string;
  librarySavedFallback: string;
  enhanceProviderFallback: string;
  templateApplied: (title: string) => string;
  componentIssueApplied: (title: string) => string;
  aiEnhanced: (provider: string) => string;
  aiLoadedFromCache: (provider: string) => string;
  aiFallbackUsed: (provider: string, reason?: string) => string;
};

type BillingMessages = {
  checkoutSuccess: string;
  checkoutCancelled: string;
};

export type ToastMessages = {
  billing: BillingMessages;
  generator: GeneratorMessages;
};

const MESSAGES: Record<ToastLocale, ToastMessages> = {
  en: {
    billing: {
      checkoutSuccess: "Stripe checkout completed.",
      checkoutCancelled: "Checkout was cancelled."
    },
    generator: {
      exportRequiresPro: "Export is available on the Pro plan.",
      shortNoteRequired: "Enter a short note first so I can expand it.",
      shortNoteExpanded: "Short note expanded into a structured bug report draft.",
      aiUnavailable: "AI enhancement is unavailable right now.",
      copied: "Copied to clipboard.",
      formReset: "Form reset.",
      wcagApplied: "Suggested WCAG mapping applied.",
      reportSavedFallback: "Bug report saved.",
      librarySavedFallback: "Saved to bug library.",
      enhanceProviderFallback: "AI provider",
      templateApplied: (title: string) => `Applied template: ${title}`,
      componentIssueApplied: (title: string) => `Applied component issue: ${title}`,
      aiEnhanced: (provider: string) => `Enhanced with ${provider}.`,
      aiLoadedFromCache: (provider: string) => `Loaded cached AI enhancement from ${provider}.`,
      aiFallbackUsed: (provider: string, reason?: string) =>
        `AI quality fallback used (${provider}).${reason ? ` ${reason}` : ""}`
    }
  },
  uk: {
    billing: {
      checkoutSuccess: "Оплату Stripe завершено.",
      checkoutCancelled: "Оплату скасовано."
    },
    generator: {
      exportRequiresPro: "Експорт доступний лише на тарифі Pro.",
      shortNoteRequired: "Додай коротку нотатку, щоб я зміг розгорнути її в баг.",
      shortNoteExpanded: "Коротку нотатку розгорнуто в структурований драфт баг-репорту.",
      aiUnavailable: "AI-покращення зараз недоступне.",
      copied: "Скопійовано в буфер обміну.",
      formReset: "Форму скинуто.",
      wcagApplied: "Рекомендований WCAG застосовано.",
      reportSavedFallback: "Баг-репорт збережено.",
      librarySavedFallback: "Додано в бібліотеку багів.",
      enhanceProviderFallback: "AI-провайдер",
      templateApplied: (title: string) => `Застосовано шаблон: ${title}`,
      componentIssueApplied: (title: string) => `Застосовано проблему компонента: ${title}`,
      aiEnhanced: (provider: string) => `Покращено через ${provider}.`,
      aiLoadedFromCache: (provider: string) => `Завантажено з AI-кешу: ${provider}.`,
      aiFallbackUsed: (provider: string, reason?: string) =>
        `Застосовано fallback за якістю AI (${provider}).${reason ? ` ${reason}` : ""}`
    }
  }
};

export function resolveToastLocale(value?: string | null): ToastLocale {
  const normalized = value?.toLowerCase().trim();

  if (normalized?.startsWith("uk")) {
    return "uk";
  }

  if (normalized?.startsWith("en")) {
    return "en";
  }

  return "en";
}

export function getToastMessages(locale: ToastLocale): ToastMessages {
  return MESSAGES[locale];
}
