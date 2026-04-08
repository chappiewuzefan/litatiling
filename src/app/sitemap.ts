import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const paths = ["/en", "/zh", "/en/thanks", "/zh/thanks", "/en/privacy", "/zh/privacy"];

  return paths.map((path) => ({
    url: absoluteUrl(path),
    lastModified: now,
    changeFrequency: path.includes("thanks") ? "monthly" : "weekly",
    priority: path === "/en" ? 1 : 0.8,
  }));
}
