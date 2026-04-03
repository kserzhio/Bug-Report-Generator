import { cookies } from "next/headers";

import { DEFAULT_LOCALE, normalizeLocale, type Locale } from "@/lib/i18n/locale";

export async function getRequestLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  return normalizeLocale(cookieStore.get("ui-locale")?.value ?? DEFAULT_LOCALE);
}
