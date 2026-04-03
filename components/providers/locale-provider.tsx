"use client";

import { createContext, useContext, useEffect, type ReactNode } from "react";

import { getMessages } from "@/lib/i18n/messages";
import { normalizeLocale, type Locale } from "@/lib/i18n/locale";

type LocaleContextValue = {
  locale: Locale;
  messages: ReturnType<typeof getMessages>;
};

const LocaleContext = createContext<LocaleContextValue>({
  locale: "en",
  messages: getMessages("en")
});

export function LocaleProvider({
  locale,
  children
}: {
  locale: Locale;
  children: ReactNode;
}) {
  const normalized = normalizeLocale(locale);

  useEffect(() => {
    document.documentElement.lang = normalized;
  }, [normalized]);

  return (
    <LocaleContext.Provider value={{ locale: normalized, messages: getMessages(normalized) }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext).locale;
}

export function useI18n() {
  return useContext(LocaleContext).messages;
}
