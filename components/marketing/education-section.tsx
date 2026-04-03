"use client";

import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";

const articles = [
  {
    category: "WCAG 2.2",
    categoryColor: "#8B5CF6",
    categoryBg: "rgba(139,92,246,0.1)",
    title: "What's new in WCAG 2.2 — a QA engineer's guide",
    description:
      "Nine new success criteria including Focus Appearance, Dragging Movements, and Target Size. What changes in your test plans and how BugWriter handles them automatically.",
    readTime: "6 min read",
    tag: "Guide",
    href: "/compare/wcag-21-vs-22-for-qa"
  },
  {
    category: "Accessibility",
    categoryColor: "#06B6D4",
    categoryBg: "rgba(6,182,212,0.1)",
    title: "Keyboard navigation bugs: the complete taxonomy",
    description:
      "From focus traps to invisible focus rings, this guide maps every keyboard accessibility failure mode to the right WCAG criterion and severity level.",
    readTime: "9 min read",
    tag: "Deep dive",
    href: "/compare/keyboard-vs-screen-reader"
  },
  {
    category: "Testing",
    categoryColor: "#10B981",
    categoryBg: "rgba(16,185,129,0.1)",
    title: "Color contrast testing in 2025: tools, tips, and traps",
    description:
      "APCA vs WCAG contrast algorithms, real-world edge cases, and how to write contrast bug reports that developers won't dismiss.",
    readTime: "5 min read",
    tag: "Tutorial",
    href: "/guides"
  }
];

export function EducationSection() {
  return (
    <section className="relative py-24" id="docs">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p
              className="mb-3 uppercase tracking-widest"
              style={{ fontSize: "11px", color: "#4A5568", fontWeight: 600, letterSpacing: "0.15em" }}
            >
              Knowledge base
            </p>
            <h2
              style={{
                fontSize: "clamp(26px, 3vw, 36px)",
                fontWeight: 700,
                color: "#F4F4F5",
                letterSpacing: "-0.025em",
                lineHeight: 1.2
              }}
            >
              What's new in{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #06B6D4, #10B981)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text"
                }}
              >
                accessibility
              </span>
            </h2>
          </div>
          <Link
            href="/news"
            className="group flex items-center gap-2 text-[#8B9BB4] transition-colors hover:text-white"
            style={{ fontSize: "14px" }}
          >
            View all articles
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {articles.map(({ category, categoryColor, categoryBg, title, description, readTime, tag, href }) => (
            <Link
              key={title}
              href={href}
              className="group flex cursor-pointer flex-col rounded-2xl p-6 transition-all duration-300"
              style={{
                background: "linear-gradient(135deg, #151A21 0%, #0F1419 100%)",
                border: "1px solid rgba(255,255,255,0.06)"
              }}
            >
              <div className="mb-5 flex items-center justify-between">
                <span
                  className="rounded-md px-2.5 py-1"
                  style={{ fontSize: "11px", fontWeight: 500, color: categoryColor, background: categoryBg }}
                >
                  {category}
                </span>
                <span style={{ fontSize: "11px", color: "#4A5568" }}>{tag}</span>
              </div>

              <h3
                className="mb-3 transition-colors group-hover:text-white"
                style={{ fontSize: "15px", fontWeight: 600, color: "#E2E8F0", lineHeight: 1.45, letterSpacing: "-0.01em" }}
              >
                {title}
              </h3>

              <p className="mb-5 flex-1" style={{ fontSize: "13px", color: "#8B9BB4", lineHeight: 1.7 }}>
                {description}
              </p>

              <div className="flex items-center justify-between border-t border-white/5 pt-4">
                <div className="flex items-center gap-1.5">
                  <Clock size={11} className="text-[#4A5568]" />
                  <span style={{ fontSize: "11px", color: "#4A5568" }}>{readTime}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#8B9BB4] transition-colors group-hover:text-white">
                  <span style={{ fontSize: "12px" }}>Read article</span>
                  <ArrowRight size={11} className="transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
