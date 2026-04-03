"use client";

import { LogOut } from "lucide-react";

import { useI18n } from "@/components/providers/locale-provider";
import { signOutAction } from "@/src/server/actions/dashboard-actions";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  const t = useI18n();

  return (
    <form action={signOutAction}>
      <Button className="w-full justify-center border-[#1f2937] bg-[#0b1220] text-slate-200 hover:bg-[#111827]" variant="outline">
        <LogOut className="h-4 w-4" />
        {t.common.signOut}
      </Button>
    </form>
  );
}


