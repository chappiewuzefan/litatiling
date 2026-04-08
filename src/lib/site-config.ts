export const locales = ["en", "zh"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

const siteUrlValue =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "https://www.litatiling.com.au";
const brandNameValue =
  process.env.NEXT_PUBLIC_BRAND_NAME ?? "LITA Tiling Canberra";
const phoneDisplayValue =
  process.env.NEXT_PUBLIC_PHONE_DISPLAY ?? "0435 248 809";
const emailValue =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "litamia810@gmail.com";

function toTelHref(phoneNumber: string) {
  const cleaned = phoneNumber.replace(/[^\d+]/g, "");
  return `tel:${cleaned || phoneNumber}`;
}

export const siteConfig = {
  brandName: brandNameValue,
  legalName: process.env.NEXT_PUBLIC_LEGAL_NAME ?? "LITA CONSTRUCTION PTY LTD",
  siteUrl: siteUrlValue,
  phoneDisplay: phoneDisplayValue,
  phoneHref: toTelHref(phoneDisplayValue),
  email: emailValue,
  emailHref: `mailto:${emailValue}`,
  primaryCity: "Canberra",
  region: "ACT",
  countryCode: "AU",
  priceRange: "$$",
  serviceAreas: [
    "Belconnen",
    "Gungahlin",
    "Woden Valley",
    "Tuggeranong",
    "Inner North",
    "Inner South",
    "Molonglo Valley",
    "Weston Creek",
  ],
  openingHours: [
    { day: "Monday", opens: "07:30", closes: "17:30" },
    { day: "Tuesday", opens: "07:30", closes: "17:30" },
    { day: "Wednesday", opens: "07:30", closes: "17:30" },
    { day: "Thursday", opens: "07:30", closes: "17:30" },
    { day: "Friday", opens: "07:30", closes: "17:30" },
    { day: "Saturday", opens: "08:30", closes: "14:00" },
  ],
  firebaseCollection: process.env.FIREBASE_CONTACT_COLLECTION ?? "contactLeads",
  placeholderChecks: {
    usesExampleDomain:
      siteUrlValue === "https://example.com" || emailValue.endsWith("@example.com"),
    usesPlaceholderPhone: phoneDisplayValue === "0400 000 000",
    usesPlaceholderBrand:
      brandNameValue === "Canberra Tiling & Waterproofing",
  },
};

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function getLocalizedPath(locale: Locale, path = "") {
  const normalizedPath = path
    ? path.startsWith("/")
      ? path
      : `/${path}`
    : "";

  return `/${locale}${normalizedPath}`;
}

export function getLocaleHref(locale: Locale, path = "") {
  return absoluteUrl(getLocalizedPath(locale, path));
}

export function absoluteUrl(path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return new URL(normalizedPath, siteConfig.siteUrl).toString();
}

export function getHtmlLang(locale: Locale) {
  return locale === "zh" ? "zh-CN" : "en-AU";
}

export function getLanguageAlternates(path = "") {
  return {
    "en-AU": getLocaleHref("en", path),
    "zh-CN": getLocaleHref("zh", path),
    "x-default": getLocaleHref(defaultLocale, path),
  };
}

export function hasPlaceholderContent() {
  return Object.values(siteConfig.placeholderChecks).some(Boolean);
}
