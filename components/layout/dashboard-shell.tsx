import type { ReactNode } from "react";

import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardTopBar } from "@/components/dashboard/top-bar";

type DashboardShellProps = {
  children: ReactNode;
  userName: string | null;
  userEmail: string | null;
};

export function DashboardShell({ children, userName, userEmail }: DashboardShellProps) {
  return (
    <div className="dashboard-theme flex h-screen w-full bg-[#0B0F14]">
      <DashboardSidebar />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="px-3 pb-3 pt-3 lg:px-4 lg:pb-4 lg:pt-4">
          <DashboardTopBar userName={userName} userEmail={userEmail} />
        </div>

        <main className="min-h-0 flex-1 overflow-y-auto px-3 pb-3 lg:px-4 lg:pb-4">{children}</main>
      </div>
    </div>
  );
}
