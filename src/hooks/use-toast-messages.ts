"use client";

import { useMemo } from "react";

import {
  getToastMessages,
  resolveToastLocale,
  type ToastMessages
} from "@/lib/ui/toast-messages";

export function useToastMessages(): ToastMessages {
  const localeHint =
    typeof document !== "undefined"
      ? document.documentElement.lang
      : process.env.NEXT_PUBLIC_UI_LOCALE;

  const locale = resolveToastLocale(localeHint);

  return useMemo(() => getToastMessages(locale), [locale]);
}
