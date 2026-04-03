"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bug, Menu, X } from "lucide-react";

export function LandingHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "Templates", href: "#templates" },
    { label: "Pricing", href: "#pricing" },
    { label: "Docs", href: "/guides" },
    { label: "Support", href: "/support" }
  ];

  return (
    <header
      className="fixed left-0 right-0 top-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "rgba(11,15,20,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent"
      }}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="group flex items-center gap-2.5">
          <div
            className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg"
            style={{ background: "linear-gradient(135deg, #E41F07 0%, #FF6B35 100%)" }}
          >
            <Bug size={16} className="relative z-10 text-white" />
            <div
              className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{ background: "linear-gradient(135deg, #FF6B35 0%, #E41F07 100%)" }}
            />
          </div>
          <span className="text-white" style={{ fontSize: "15px", fontWeight: 600, letterSpacing: "-0.01em" }}>
            Bug<span style={{ color: "#E41F07" }}>Writer</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="rounded-md px-3.5 py-1.5 text-[#8B9BB4] transition-all duration-200 hover:bg-white/5 hover:text-white"
              style={{ fontSize: "14px" }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/sign-in"
            className="rounded-md px-4 py-1.5 text-[#8B9BB4] transition-colors duration-200 hover:text-white"
            style={{ fontSize: "14px" }}
          >
            Sign in
          </Link>
          <button
            onClick={() => router.push("/sign-up?next=%2Fdashboard%2Fgenerator")}
            className="group relative overflow-hidden rounded-md px-4 py-1.5 text-white transition-all duration-200"
            style={{
              fontSize: "14px",
              fontWeight: 500,
              background: "linear-gradient(135deg, #E41F07 0%, #FF4520 100%)",
              boxShadow: "0 0 20px rgba(228,31,7,0.35)"
            }}
          >
            <span className="relative z-10">Start free</span>
            <div
              className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{ background: "linear-gradient(135deg, #FF4520 0%, #E41F07 100%)" }}
            />
          </button>
        </div>

        <button className="text-[#8B9BB4] hover:text-white md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {menuOpen ? (
        <div
          className="flex flex-col gap-2 px-6 pb-4 md:hidden"
          style={{ background: "rgba(11,15,20,0.98)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="py-2 text-[#8B9BB4] transition-colors hover:text-white"
              style={{ fontSize: "14px" }}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="flex gap-3 pt-2">
            <Link
              href="/sign-in"
              className="flex-1 rounded-md border border-white/10 py-2 text-center text-sm text-[#8B9BB4] hover:text-white"
              onClick={() => setMenuOpen(false)}
            >
              Sign in
            </Link>
            <button
              onClick={() => {
                setMenuOpen(false);
                router.push("/sign-up?next=%2Fdashboard%2Fgenerator");
              }}
              className="flex-1 rounded-md py-2 text-sm text-white"
              style={{ background: "linear-gradient(135deg, #E41F07 0%, #FF4520 100%)" }}
            >
              Start free
            </button>
          </div>
        </div>
      ) : null}
    </header>
  );
}
