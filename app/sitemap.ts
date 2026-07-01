import type { MetadataRoute } from "next";

import { examples } from "@/features/examples/examples.data";
import { getSiteUrl } from "@/lib/site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const routes = [
    "",
    "/services",
    "/about",
    "/examples",
    "/privacy",
    "/terms",
    "/ai-disclosure",
    "/data-notice",
    "/third-party-notices",
    "/accessibility",
    ...examples.map((example) => `/examples/${example.slug}`),
  ];

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route.includes("privacy") || route.includes("terms")
      ? "yearly"
      : "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
}
