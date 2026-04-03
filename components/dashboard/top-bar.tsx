"use client";

import { Search } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useI18n, useLocale } from "@/components/providers/locale-provider";
import { setDashboardLocaleAction, signOutAction } from "@/src/server/actions/dashboard-actions";

type DashboardTopBarProps = {
  userName: string | null;
  userEmail: string | null;
};

function getInitials(userName: string | null, userEmail: string | null) {
  const source = (userName?.trim() || userEmail?.split("@")[0] || "User").trim();
  const parts = source.split(/\s+/).filter(Boolean);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export function DashboardTopBar({ userName, userEmail }: DashboardTopBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const t = useI18n();
  const locale = useLocale();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState("");

  const title = useMemo(() => {
    if (pathname.startsWith("/dashboard/generator")) return t.dashboard.generatorTitle;
    if (pathname.startsWith("/dashboard/templates")) return t.sidebar.templates;
    if (pathname.startsWith("/dashboard/history")) return t.sidebar.history;
    if (pathname.startsWith("/dashboard/library")) return t.sidebar.library;
    if (pathname.startsWith("/dashboard/projects")) return t.sidebar.projects;
    if (pathname.startsWith("/dashboard/analytics")) return t.sidebar.analytics;
    if (pathname.startsWith("/dashboard/billing")) return t.sidebar.billing;
    if (pathname.startsWith("/dashboard/settings")) return t.sidebar.settings;

    return "Dashboard";
  }, [pathname, t]);

  const initials = getInitials(userName, userEmail);

  return (
    <header className="dashboard-topbar sticky top-0 z-30 mb-5 rounded-2xl border border-white/10 bg-[#0B0F14]/95 px-4 py-3 backdrop-blur lg:px-5">
      <div className="flex items-center justify-between gap-4">
        <h1 className="truncate text-[28px] font-semibold tracking-tight text-[#F4F4F5]">{title}</h1>

        <div className="flex items-center gap-3">
          <div className="relative hidden md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search..."
              className="h-10 w-[260px] rounded-xl border border-white/10 bg-white/[0.03] pl-9 pr-3 text-sm text-[#E2E8F0] outline-none placeholder:text-[#64748B] focus:border-[#334155]"
            />
          </div>

          <div className="flex items-center rounded-xl border border-white/10 bg-white/[0.03] p-1">
            <button
              type="button"
              disabled={isPending || locale === "en"}
              onClick={() => {
                startTransition(async () => {
                  await setDashboardLocaleAction("en");
                  router.refresh();
                });
              }}
              className={`rounded-lg px-2.5 py-1.5 text-sm font-semibold transition ${
                locale === "en" ? "bg-white/10 text-white" : "text-[#8B9BB4] hover:text-white"
              }`}
            >
              EN
            </button>
            <button
              type="button"
              disabled={isPending || locale === "uk"}
              onClick={() => {
                startTransition(async () => {
                  await setDashboardLocaleAction("uk");
                  router.refresh();
                });
              }}
              className={`rounded-lg px-2.5 py-1.5 text-sm font-semibold transition ${
                locale === "uk" ? "bg-white/10 text-white" : "text-[#8B9BB4] hover:text-white"
              }`}
            >
              UK
            </button>
          </div>

          <form action={signOutAction}>
            <button
              type="submit"
              className="h-10 rounded-xl border border-white/10 bg-white/[0.03] px-3 text-sm font-medium text-slate-200 transition hover:bg-white/10"
            >
              {t.common.signOut}
            </button>
          </form>

          <details className="relative">
            <summary className="list-none">
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#38BDF8] text-sm font-bold text-white"
              >
                {initials}
              </button>
            </summary>
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-white/10 bg-[#0f172a] p-3 shadow-2xl">
              <p className="truncate text-sm font-semibold text-slate-100">{userName || "User"}</p>
              <p className="truncate text-xs text-slate-400">{userEmail || ""}</p>
              <div className="mt-3 border-t border-white/10 pt-3">
                <form action={signOutAction}>
                  <button
                    type="submit"
                    className="w-full rounded-lg border border-white/10 bg-[#111827] px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-[#1f2937]"
                  >
                    {t.common.signOut}
                  </button>
                </form>
              </div>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
