import type { MetadataRoute } from "next";

function getBaseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
}

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/news", "/guides", "/faq", "/checklists", "/compare", "/examples", "/wcag", "/features", "/pricing"],
        disallow: ["/dashboard", "/sign-in", "/sign-up", "/forgot-password", "/reset-password", "/api"]
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl
  };
}
