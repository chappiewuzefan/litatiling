import Link from "next/link";

import {
  getLocalizedPath,
  getPhoneLabels,
  siteConfig,
  type Locale,
} from "@/lib/site-config";

type SiteFooterProps = {
  locale: Locale;
  footer: {
    tagline: string;
    rights: string;
    home: string;
    services: string;
    guides: string;
    areas: string;
    about: string;
    privacy: string;
  };
};

export function SiteFooter({ locale, footer }: SiteFooterProps) {
  const phoneLabels = getPhoneLabels(locale);
  const links = [
    { label: footer.home, href: getLocalizedPath(locale) },
    { label: footer.services, href: getLocalizedPath(locale, "/services") },
    { label: footer.guides, href: getLocalizedPath(locale, "/guides") },
    { label: footer.areas, href: getLocalizedPath(locale, "/service-areas") },
    { label: footer.about, href: getLocalizedPath(locale, "/about") },
    { label: footer.privacy, href: getLocalizedPath(locale, "/privacy") },
  ];

  return (
    <footer className="border-t border-[var(--line)] bg-[var(--surface)] text-[var(--ink-soft)]">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.25fr_0.75fr_0.75fr] lg:px-8">
        <div className="space-y-4">
          <p className="font-heading text-xl font-semibold text-[var(--ink)]">
            {siteConfig.brandName}
          </p>
          <p className="max-w-xl text-sm leading-7 text-[var(--muted)]">
            {footer.tagline}
          </p>
          <div className="flex flex-col gap-2 text-sm sm:flex-row sm:flex-wrap sm:gap-4">
            {siteConfig.phoneContacts.map((phone) => (
              <a
                key={phone.kind}
                href={phone.href}
                className="inline-flex min-h-11 items-center font-semibold transition hover:text-[var(--accent-strong)]"
              >
                {phoneLabels[phone.kind].short}: {phone.display}
              </a>
            ))}
            <a
              href={siteConfig.emailHref}
              className="inline-flex min-h-11 items-center break-all transition hover:text-[var(--accent-strong)]"
            >
              {siteConfig.email}
            </a>
          </div>
        </div>

        <nav
          aria-label="Footer"
          className="grid grid-cols-2 gap-x-5 gap-y-1 text-sm lg:grid-cols-1"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex min-h-11 items-center transition hover:text-[var(--accent-strong)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="text-sm leading-7 text-[var(--muted)]">
          <p>
            {siteConfig.primaryCity}, {siteConfig.region}
          </p>
          <p className="mt-3">{siteConfig.serviceAreas.join(" / ")}</p>
          <p className="mt-5">{footer.rights}</p>
        </div>
      </div>
    </footer>
  );
}
