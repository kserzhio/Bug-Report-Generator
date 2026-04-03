import Link from "next/link";
import type { ReactNode } from "react";
import { Bug } from "lucide-react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0B0F14] text-[#F4F4F5]">
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.45) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.45) 1px, transparent 1px)",
            backgroundSize: "56px 56px"
          }}
        />
        <div className="absolute left-[10%] top-[-120px] h-[420px] w-[420px] rounded-full bg-[#8B5CF6]/20 blur-[110px]" />
        <div className="absolute bottom-[-140px] right-[8%] h-[420px] w-[420px] rounded-full bg-[#06B6D4]/15 blur-[110px]" />
        <div className="absolute bottom-[8%] left-[20%] h-[260px] w-[260px] rounded-full bg-[#E41F07]/10 blur-[100px]" />
      </div>

      <header className="relative z-10 border-b border-white/10 bg-black/20 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#E41F07] to-[#FF6B35]">
              <Bug size={15} className="text-white" />
            </div>
            <span className="text-sm font-semibold text-white">
              Bug<span className="text-[#E41F07]">Writer</span>
            </span>
          </Link>
          <Link href="/" className="text-sm text-zinc-300 transition-colors hover:text-white">
            Back to home
          </Link>
        </div>
      </header>

      <main className="relative z-10 flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-10">{children}</main>
    </div>
  );
}
