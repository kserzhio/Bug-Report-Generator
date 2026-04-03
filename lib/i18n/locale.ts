export type Locale = "en" | "uk";

export const DEFAULT_LOCALE: Locale = "en";

export function normalizeLocale(value: string | null | undefined): Locale {
  return value === "uk" ? "uk" : "en";
}
