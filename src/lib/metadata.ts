import type { Metadata } from "next";

import {
  absoluteUrl,
  getHtmlLang,
  getLanguageAlternates,
  getLocalizedPath,
  siteConfig,
  type Locale,
} from "@/lib/site-config";

export function buildMetadata(options: {
  locale: Locale;
  path?: string;
  title: string;
  description: string;
  keywords: string[];
}): Metadata {
  const path = options.path ?? "";
  const canonical = absoluteUrl(getLocalizedPath(options.locale, path));

  return {
    title: options.title,
    description: options.description,
    keywords: options.keywords,
    alternates: {
      canonical,
      languages: getLanguageAlternates(path),
    },
    openGraph: {
      title: options.title,
      description: options.description,
      url: canonical,
      siteName: siteConfig.brandName,
      type: "website",
      locale: getHtmlLang(options.locale).replace("-", "_"),
      images: [
        {
          url: absoluteUrl("/social-preview.svg"),
          width: 1200,
          height: 630,
          alt: siteConfig.brandName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: options.title,
      description: options.description,
      images: [absoluteUrl("/social-preview.svg")],
    },
    other: {
      "content-language": getHtmlLang(options.locale),
    },
  };
}
