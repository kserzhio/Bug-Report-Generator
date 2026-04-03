"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookCopy,
  Bug,
  ChartNoAxesColumn,
  FileStack,
  Files,
  FolderKanban,
  LayoutTemplate,
  Settings,
  Wallet
} from "lucide-react";

import { useI18n } from "@/components/providers/locale-provider";
import { cn } from "@/lib/utils/cn";

export function DashboardSidebar() {
  const pathname = usePathname();
  const t = useI18n();

  const navigation = [
    { href: "/dashboard/generator", label: t.sidebar.generator, icon: FileStack },
    { href: "/dashboard/templates", label: t.sidebar.templates, icon: LayoutTemplate },
    { href: "/dashboard/history", label: t.sidebar.history, icon: Files },
    { href: "/dashboard/library", label: t.sidebar.library, icon: BookCopy },
    { href: "/dashboard/projects", label: t.sidebar.projects, icon: FolderKanban },
    { href: "/dashboard/analytics", label: t.sidebar.analytics, icon: ChartNoAxesColumn },
    { href: "/dashboard/billing", label: t.sidebar.billing, icon: Wallet },
    { href: "/dashboard/settings", label: t.sidebar.settings, icon: Settings }
  ];

  return (
    <aside className="dashboard-sidebar h-full w-[260px] shrink-0 overflow-y-auto border-r border-[#182334] bg-[#050c17] text-white">
      <div className="border-b border-white/5 px-4 py-4">
        <Link href="/dashboard/generator" className="group flex items-center gap-2.5">
          <div
            className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg"
            style={{ background: "linear-gradient(135deg, #E41F07 0%, #FF6B35 100%)" }}
          >
            <Bug size={15} className="relative z-10 text-white" />
            <div
              className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{ background: "linear-gradient(135deg, #FF6B35 0%, #E41F07 100%)" }}
            />
          </div>
          <div>
            <p className="text-base font-semibold leading-tight text-white">Bug Writer</p>
            <p className="text-xs text-slate-500">QA & Accessibility</p>
          </div>
        </Link>
      </div>

      <nav className="space-y-1.5 p-3">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors",
                isActive
                  ? "bg-[#2a0a0e] text-[#ff3b30]"
                  : "text-slate-300 hover:bg-[#0f172a] hover:text-white"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="m-3 rounded-xl border border-white/10 bg-[#0a1322] p-3">
        <p className="text-sm font-semibold text-slate-100">Pro Plan</p>
        <p className="text-xs text-slate-400">Unlimited reports</p>
      </div>
    </aside>
  );
}

