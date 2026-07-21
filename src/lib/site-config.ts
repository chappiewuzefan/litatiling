export const locales = ["en", "zh"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const contentLastModified = "2026-07-21";
export const socialPreviewPath = "/social-preview.webp";

export type PhoneContactKind = "primary" | "backup";

export type PhoneContact = {
  kind: PhoneContactKind;
  display: string;
  href: string;
};

const siteUrlValue =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "https://www.litatiling.com";
const brandNameValue =
  process.env.NEXT_PUBLIC_BRAND_NAME ?? "LITA Tiling Canberra";
const primaryPhoneDisplayValue =
  process.env.NEXT_PUBLIC_PHONE_DISPLAY ?? "0435 248 809";
const backupPhoneDisplayValue =
  process.env.NEXT_PUBLIC_BACKUP_PHONE_DISPLAY ?? "0478 516 702";
const emailValue =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "litamia810@gmail.com";

function toTelHref(phoneNumber: string) {
  const cleaned = phoneNumber.replace(/[^\d+]/g, "");
  return `tel:${cleaned || phoneNumber}`;
}

function createPhoneContact(
  kind: PhoneContactKind,
  display: string,
): PhoneContact {
  return { kind, display, href: toTelHref(display) };
}

const primaryPhone = createPhoneContact("primary", primaryPhoneDisplayValue);
const backupPhone = createPhoneContact("backup", backupPhoneDisplayValue);

export const siteConfig = {
  brandName: brandNameValue,
  legalName: process.env.NEXT_PUBLIC_LEGAL_NAME ?? "LITA CONSTRUCTION PTY LTD",
  siteUrl: siteUrlValue,
  primaryPhone,
  backupPhone,
  phoneContacts: [primaryPhone, backupPhone] as const,
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
      siteUrlValue === "https://example.com" ||
      emailValue.endsWith("@example.com"),
    usesPlaceholderPhone:
      primaryPhoneDisplayValue === "0400 000 000" ||
      backupPhoneDisplayValue === "0400 000 000",
    usesPlaceholderBrand: brandNameValue === "Canberra Tiling & Waterproofing",
  },
};

export function getPhoneLabels(locale: Locale) {
  if (locale === "zh") {
    return {
      primary: { short: "主号码", action: "拨打主号码" },
      backup: { short: "备用号码", action: "拨打备用号码" },
    } as const;
  }

  return {
    primary: { short: "Primary", action: "Call primary" },
    backup: { short: "Backup", action: "Call backup" },
  } as const;
}

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function getLocalizedPath(locale: Locale, path = "") {
  const normalizedPath = path ? (path.startsWith("/") ? path : `/${path}`) : "";

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
  return locale === "zh" ? "zh-Hans-AU" : "en-AU";
}

export function getLanguageAlternates(path = "") {
  return {
    "en-AU": getLocaleHref("en", path),
    "zh-Hans-AU": getLocaleHref("zh", path),
    "x-default": getLocaleHref(defaultLocale, path),
  };
}

export function hasPlaceholderContent() {
  return Object.values(siteConfig.placeholderChecks).some(Boolean);
}
