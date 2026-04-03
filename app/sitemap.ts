import type { MetadataRoute } from "next";

import { ACCESSIBILITY_NEWS_ITEMS } from "@/src/domain/services/accessibility-news-service";
import { getAllExampleComponents } from "@/src/domain/services/component-examples-service";
import { getWcagCriteriaSummaries } from "@/src/domain/services/wcag-content-service";

function getBaseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getBaseUrl();
  const now = new Date();

  const staticRoutes = [
    "/",
    "/pricing",
    "/news",
    "/guides",
    "/faq",
    "/accessibility-bug-report-template",
    "/wcag-bug-report-examples",
    "/checklists",
    "/checklists/accessibility-release",
    "/compare/keyboard-vs-screen-reader",
    "/compare/manual-vs-automated-accessibility-testing",
    "/compare/wcag-21-vs-22-for-qa",
    "/examples",
    "/wcag",
    "/features/bug-report-quality-score"
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: path === "/" ? 1 : 0.7
  }));

  const newsRoutes = ACCESSIBILITY_NEWS_ITEMS.filter((item) => item.detail).map((item) => ({
    url: `${baseUrl}/news/${item.id}`,
    lastModified: new Date(item.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.7
  }));

  const exampleRoutes = getAllExampleComponents().map((component) => ({
    url: `${baseUrl}/examples/${component}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.65
  }));

  const wcagRoutes = getWcagCriteriaSummaries().map((item) => ({
    url: `${baseUrl}/wcag/${item.code}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.65
  }));

  return [...staticRoutes, ...newsRoutes, ...exampleRoutes, ...wcagRoutes];
}
