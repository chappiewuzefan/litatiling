import Link from "next/link";

import {
  getLocalizedPath,
  getPhoneLabels,
  siteConfig,
  type Locale,
} from "@/lib/site-config";

type SiteHeaderProps = {
  locale: Locale;
  currentPath?: string;
  labels: {
    services: string;
    guides: string;
    about: string;
    projects: string;
    process: string;
    areas: string;
    faq: string;
    contact: string;
    privacy: string;
    backHome: string;
  };
  isHome?: boolean;
};

export function SiteHeader({
  locale,
  labels,
}: SiteHeaderProps) {
  const phoneLabels = getPhoneLabels(locale);
  const links = [
    { label: labels.services, href: getLocalizedPath(locale, "/services") },
    { label: labels.guides, href: getLocalizedPath(locale, "/guides") },
    { label: labels.areas, href: getLocalizedPath(locale, "/service-areas") },
    { label: labels.about, href: getLocalizedPath(locale, "/about") },
    { label: labels.projects, href: `${getLocalizedPath(locale)}#projects` },
    { label: labels.contact, href: `${getLocalizedPath(locale)}#contact` },
  ];

  return (
    <header className="sticky top-0 z-30 h-[72px] border-b border-[var(--line)] bg-[color:var(--surface)]/95 backdrop-blur-xl">
      <div className="relative mx-auto flex h-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          prefetch={false}
          href={getLocalizedPath(locale)}
          className="shrink-0 rounded-sm font-heading text-base font-semibold tracking-[-0.01em] text-[var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)] sm:text-lg"
        >
          LITA Tiling
        </Link>

        <div className="hidden min-w-0 items-center gap-4 lg:flex">
          <nav aria-label="Primary" className="flex items-center gap-3 text-sm">
            {links.map((link) => (
              <Link
                prefetch={false}
                key={link.href}
                href={link.href}
                className="flex min-h-11 items-center whitespace-nowrap rounded-sm text-[var(--muted)] transition hover:text-[var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="hidden items-center gap-3 xl:flex">
            {siteConfig.phoneContacts.map((phone) => (
              <a
                key={phone.kind}
                href={phone.href}
                className={`inline-flex min-h-11 items-center whitespace-nowrap text-xs font-semibold ${phone.kind === "primary" ? "text-[var(--accent-strong)]" : "text-[var(--muted)]"}`}
              >
                {phoneLabels[phone.kind].short}: {phone.display}
              </a>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <details className="group relative">
            <summary className="flex min-h-11 cursor-pointer list-none items-center rounded-full border border-[var(--line)] px-4 text-xs font-semibold text-[var(--ink)] transition hover:bg-[var(--surface-muted)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]">
              {locale === "zh" ? "菜单" : "Menu"}
            </summary>
            <nav
              aria-label="Mobile primary"
              className="absolute right-0 top-[calc(100%+0.75rem)] w-72 overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-2 shadow-[var(--shadow-image)]"
            >
              {links.map((link) => (
                <Link
                  prefetch={false}
                  key={link.href}
                  href={link.href}
                  className="flex min-h-11 items-center rounded-xl px-4 text-sm text-[var(--ink)] transition hover:bg-[var(--surface-muted)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-2 border-t border-[var(--line)] pt-2">
                {siteConfig.phoneContacts.map((phone) => (
                  <a
                    key={phone.kind}
                    href={phone.href}
                    className="flex min-h-11 items-center rounded-xl px-4 text-sm font-semibold text-[var(--accent-strong)]"
                  >
                    {phoneLabels[phone.kind].short}: {phone.display}
                  </a>
                ))}
              </div>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
