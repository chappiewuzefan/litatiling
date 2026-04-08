import { getContent } from "@/lib/content";
import {
  absoluteUrl,
  getHtmlLang,
  getLocalizedPath,
  siteConfig,
  type Locale,
} from "@/lib/site-config";

export function buildStructuredData(locale: Locale, path = "") {
  const content = getContent(locale);
  const pageUrl = absoluteUrl(getLocalizedPath(locale, path));

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${absoluteUrl("/")}#website`,
        url: siteConfig.siteUrl,
        name: siteConfig.brandName,
        inLanguage: ["en-AU", "zh-CN"],
      },
      {
        "@type": "LocalBusiness",
        "@id": `${absoluteUrl("/")}#business`,
        name: siteConfig.brandName,
        legalName: siteConfig.legalName,
        url: pageUrl,
        telephone: siteConfig.phoneDisplay,
        email: siteConfig.email,
        image: absoluteUrl("/social-preview.svg"),
        description: content.metadata.description,
        priceRange: siteConfig.priceRange,
        areaServed: siteConfig.serviceAreas.map(
          (area) => `${area}, ${siteConfig.primaryCity}`,
        ),
        address: {
          "@type": "PostalAddress",
          addressLocality: siteConfig.primaryCity,
          addressRegion: siteConfig.region,
          addressCountry: siteConfig.countryCode,
        },
        openingHoursSpecification: siteConfig.openingHours.map((entry) => ({
          "@type": "OpeningHoursSpecification",
          dayOfWeek: entry.day,
          opens: entry.opens,
          closes: entry.closes,
        })),
        contactPoint: [
          {
            "@type": "ContactPoint",
            contactType: "customer service",
            telephone: siteConfig.phoneDisplay,
            email: siteConfig.email,
            availableLanguage: ["English", "Chinese"],
            areaServed: `${siteConfig.primaryCity}, ${siteConfig.region}`,
          },
        ],
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name:
            locale === "zh"
              ? "住宅贴砖、防水与收边服务"
              : "Residential tiling, waterproofing and silicone services",
          itemListElement: getContent(locale).services.items.map((service) => ({
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: service.title,
              description: service.description,
              areaServed: `${siteConfig.primaryCity}, ${siteConfig.region}`,
            },
          })),
        },
      },
      {
        "@type": "WebPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: content.metadata.title,
        description: content.metadata.description,
        isPartOf: {
          "@id": `${absoluteUrl("/")}#website`,
        },
        about: {
          "@id": `${absoluteUrl("/")}#business`,
        },
        inLanguage: getHtmlLang(locale),
        primaryImageOfPage: absoluteUrl("/social-preview.svg"),
      },
    ],
  };
}
