import { getContent } from "@/lib/content";
import { getGuidePath, type Guide } from "@/lib/guides";
import {
  absoluteUrl,
  getHtmlLang,
  getLocalizedPath,
  getPhoneLabels,
  socialPreviewPath,
  siteConfig,
  type Locale,
} from "@/lib/site-config";
import type { ServicePage } from "@/lib/service-pages";

const websiteId = `${absoluteUrl("/")}#website`;
const businessId = `${absoluteUrl("/")}#business`;

export function formatAustralianPhoneForSchema(phone: string) {
  const trimmed = phone.trim();
  const digits = trimmed.replace(/\D/g, "");

  if (trimmed.startsWith("+") && digits) {
    return `+${digits}`;
  }

  if (digits.startsWith("0")) {
    return `+61${digits.slice(1)}`;
  }

  return digits.startsWith("61") ? `+${digits}` : `+61${digits}`;
}

function businessNode(locale: Locale) {
  const content = getContent(locale);
  const phoneLabels = getPhoneLabels(locale);

  return {
    "@type": "HomeAndConstructionBusiness",
    "@id": businessId,
    name: siteConfig.brandName,
    legalName: siteConfig.legalName,
    url: siteConfig.siteUrl,
    telephone: formatAustralianPhoneForSchema(
      siteConfig.primaryPhone.display,
    ),
    email: siteConfig.email,
    image: absoluteUrl(socialPreviewPath),
    logo: absoluteUrl("/lita-logo.webp"),
    description: content.metadata.description,
    priceRange: siteConfig.priceRange,
    areaServed: siteConfig.serviceAreas.map((area) => ({
      "@type": "AdministrativeArea",
      name: `${area}, ${siteConfig.primaryCity}, ${siteConfig.region}`,
    })),
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
    contactPoint: siteConfig.phoneContacts.map((phone) => ({
      "@type": "ContactPoint",
      name: phoneLabels[phone.kind].short,
      contactType: "customer service",
      telephone: formatAustralianPhoneForSchema(phone.display),
      email: siteConfig.email,
      availableLanguage: ["English", "Chinese"],
      areaServed: `${siteConfig.primaryCity}, ${siteConfig.region}`,
    })),
  };
}

function websiteNode() {
  return {
    "@type": "WebSite",
    "@id": websiteId,
    url: siteConfig.siteUrl,
    name: siteConfig.brandName,
    inLanguage: ["en-AU", "zh-Hans-AU"],
    publisher: { "@id": businessId },
  };
}

function breadcrumbNode(
  items: Array<{ name: string; path: string }>,
  pageUrl: string,
) {
  return {
    "@type": "BreadcrumbList",
    "@id": `${pageUrl}#breadcrumb`,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function buildStructuredData(locale: Locale, path = "") {
  const content = getContent(locale);
  const pageUrl = absoluteUrl(getLocalizedPath(locale, path));

  return {
    "@context": "https://schema.org",
    "@graph": [
      websiteNode(),
      {
        ...businessNode(locale),
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name:
            locale === "zh"
              ? "住宅贴砖、防水与收边服务"
              : "Residential tiling, waterproofing and finishing services",
          itemListElement: content.services.items.map((service) => ({
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
        isPartOf: { "@id": websiteId },
        about: { "@id": businessId },
        inLanguage: getHtmlLang(locale),
        primaryImageOfPage: absoluteUrl(socialPreviewPath),
      },
    ],
  };
}

export function buildServiceStructuredData(service: ServicePage) {
  const pagePath = getLocalizedPath(
    service.locale,
    `/services/${service.slug}`,
  );
  const pageUrl = absoluteUrl(pagePath);
  const homeLabel = service.locale === "zh" ? "首页" : "Home";
  const servicesLabel = service.locale === "zh" ? "服务" : "Services";

  return {
    "@context": "https://schema.org",
    "@graph": [
      websiteNode(),
      businessNode(service.locale),
      {
        "@type": "Service",
        "@id": `${pageUrl}#service`,
        name: service.name,
        description: service.description,
        url: pageUrl,
        provider: { "@id": businessId },
        areaServed: {
          "@type": "AdministrativeArea",
          name: `${siteConfig.primaryCity}, ${siteConfig.region}`,
        },
        serviceType: service.name,
      },
      {
        "@type": "WebPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: service.metadataTitle,
        description: service.description,
        isPartOf: { "@id": websiteId },
        about: { "@id": `${pageUrl}#service` },
        breadcrumb: { "@id": `${pageUrl}#breadcrumb` },
        inLanguage: getHtmlLang(service.locale),
        primaryImageOfPage: absoluteUrl(service.heroImage),
      },
      breadcrumbNode(
        [
          { name: homeLabel, path: getLocalizedPath(service.locale) },
          {
            name: servicesLabel,
            path: getLocalizedPath(service.locale, "/services"),
          },
          { name: service.name, path: pagePath },
        ],
        pageUrl,
      ),
    ],
  };
}

export function buildGuideStructuredData(guide: Guide) {
  const pagePath = getGuidePath(guide);
  const pageUrl = absoluteUrl(pagePath);
  const homeLabel = guide.locale === "zh" ? "首页" : "Home";
  const guidesLabel = guide.locale === "zh" ? "指南" : "Guides";

  return {
    "@context": "https://schema.org",
    "@graph": [
      websiteNode(),
      businessNode(guide.locale),
      {
        "@type": "Article",
        "@id": `${pageUrl}#article`,
        headline: guide.title,
        description: guide.description,
        image: absoluteUrl(guide.heroImage),
        datePublished: guide.publishedAt,
        dateModified: guide.updatedAt,
        inLanguage: getHtmlLang(guide.locale),
        mainEntityOfPage: { "@id": `${pageUrl}#webpage` },
        author: { "@id": businessId },
        publisher: { "@id": businessId },
        citation: guide.sources.map((source) => source.url),
      },
      {
        "@type": "WebPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: guide.title,
        description: guide.description,
        isPartOf: { "@id": websiteId },
        about: { "@id": businessId },
        breadcrumb: { "@id": `${pageUrl}#breadcrumb` },
        inLanguage: getHtmlLang(guide.locale),
        primaryImageOfPage: absoluteUrl(guide.heroImage),
      },
      breadcrumbNode(
        [
          { name: homeLabel, path: getLocalizedPath(guide.locale) },
          {
            name: guidesLabel,
            path: getLocalizedPath(guide.locale, "/guides"),
          },
          { name: guide.title, path: pagePath },
        ],
        pageUrl,
      ),
    ],
  };
}

export function buildCollectionStructuredData(options: {
  locale: Locale;
  path: string;
  name: string;
  description: string;
  items: Array<{ name: string; path: string }>;
}) {
  const pageUrl = absoluteUrl(getLocalizedPath(options.locale, options.path));

  return {
    "@context": "https://schema.org",
    "@graph": [
      websiteNode(),
      businessNode(options.locale),
      {
        "@type": "CollectionPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: options.name,
        description: options.description,
        isPartOf: { "@id": websiteId },
        inLanguage: getHtmlLang(options.locale),
        mainEntity: { "@id": `${pageUrl}#items` },
      },
      {
        "@type": "ItemList",
        "@id": `${pageUrl}#items`,
        itemListElement: options.items.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          url: absoluteUrl(item.path),
        })),
      },
    ],
  };
}

export function buildAboutStructuredData(options: {
  locale: Locale;
  name: string;
  description: string;
}) {
  const pageUrl = absoluteUrl(getLocalizedPath(options.locale, "/about"));

  return {
    "@context": "https://schema.org",
    "@graph": [
      websiteNode(),
      businessNode(options.locale),
      {
        "@type": "AboutPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: options.name,
        description: options.description,
        isPartOf: { "@id": websiteId },
        about: { "@id": businessId },
        inLanguage: getHtmlLang(options.locale),
      },
    ],
  };
}
