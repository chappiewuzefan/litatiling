import type { MetadataRoute } from "next";

import { getAllGuides } from "@/lib/guides";
import {
  absoluteUrl,
  contentLastModified,
  getLanguageAlternates,
  getLocalizedPath,
  locales,
} from "@/lib/site-config";
import { serviceSlugs } from "@/lib/service-pages";

type SitemapEntry = { path: string; lastModified: string };

export default function sitemap(): MetadataRoute.Sitemap {
  const sharedPaths = ["", "/services", "/guides", "/about", "/service-areas"];
  const entries: SitemapEntry[] = [
    ...locales.flatMap((locale) =>
      sharedPaths.map((path) => ({
        path: getLocalizedPath(locale, path),
        lastModified: contentLastModified,
      })),
    ),
    ...locales.flatMap((locale) =>
      serviceSlugs.map((slug) => ({
        path: getLocalizedPath(locale, `/services/${slug}`),
        lastModified: contentLastModified,
      })),
    ),
    ...getAllGuides().map((guide) => ({
      path: getLocalizedPath(guide.locale, `/guides/${guide.slug}`),
      lastModified: guide.updatedAt,
    })),
  ];

  return entries.map((entry) => {
    const localizedPath = entry.path.replace(/^\/(en|zh)/, "");
    return {
      url: absoluteUrl(entry.path),
      lastModified: entry.lastModified,
      alternates: { languages: getLanguageAlternates(localizedPath) },
    };
  });
}
