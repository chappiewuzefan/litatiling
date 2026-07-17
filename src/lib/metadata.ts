import type { Metadata } from "next";

import {
  absoluteUrl,
  getHtmlLang,
  getLanguageAlternates,
  getLocalizedPath,
  socialPreviewPath,
  siteConfig,
  type Locale,
} from "@/lib/site-config";

export function buildMetadata(options: {
  locale: Locale;
  path?: string;
  title: string;
  description: string;
  image?: string;
}): Metadata {
  const path = options.path ?? "";
  const canonical = absoluteUrl(getLocalizedPath(options.locale, path));
  const image = absoluteUrl(options.image ?? socialPreviewPath);

  return {
    title: options.title,
    description: options.description,
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
          url: image,
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
      images: [image],
    },
    other: {
      "content-language": getHtmlLang(options.locale),
    },
  };
}
