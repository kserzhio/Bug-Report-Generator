import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { LocaleProvider } from "@/components/providers/locale-provider";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma/client";

export default async function DashboardLayout({
  children
}: {
  children: ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  const localeResult = session.user.workspaceId
    ? await prisma.workspace.findUnique({
        where: { id: session.user.workspaceId },
        select: { uiLocale: true }
      })
    : null;

  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("ui-locale")?.value;
  const locale: "en" | "uk" =
    cookieLocale === "uk" || cookieLocale === "en"
      ? cookieLocale
      : localeResult?.uiLocale === "uk"
        ? "uk"
        : "en";

  return (
    <LocaleProvider locale={locale}>
      <DashboardShell userName={session.user.name ?? null} userEmail={session.user.email ?? null}>
        {children}
      </DashboardShell>
    </LocaleProvider>
  );
}
