import Link from "next/link";

import { LocaleSwitcher } from "@/components/locale-switcher";
import { getLocalizedPath, siteConfig, type Locale } from "@/lib/site-config";

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
  currentPath = "",
  labels,
}: SiteHeaderProps) {
  const links = [
    { label: labels.services, href: getLocalizedPath(locale, "/services") },
    { label: labels.guides, href: getLocalizedPath(locale, "/guides") },
    { label: labels.areas, href: getLocalizedPath(locale, "/service-areas") },
    { label: labels.about, href: getLocalizedPath(locale, "/about") },
    { label: labels.projects, href: `${getLocalizedPath(locale)}#projects` },
    { label: labels.contact, href: `${getLocalizedPath(locale)}#contact` },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/90 backdrop-blur">
      <div className="relative mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="min-w-0">
          <Link
            href={getLocalizedPath(locale)}
            className="rounded-sm font-heading text-base font-semibold tracking-[0.02em] text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-300 sm:text-lg"
          >
            {siteConfig.brandName}
          </Link>
          <p className="mt-1 text-xs text-slate-300">
            {siteConfig.primaryCity}, {siteConfig.region} ·{" "}
            {siteConfig.phoneDisplay}
          </p>
        </div>

        <div className="hidden items-center gap-5 lg:flex">
          <nav aria-label="Primary" className="flex items-center gap-4 text-sm">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex min-h-11 items-center rounded-sm text-slate-200 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-300"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <LocaleSwitcher locale={locale} path={currentPath} />
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <LocaleSwitcher locale={locale} path={currentPath} />
          <details className="group relative">
            <summary className="flex min-h-11 cursor-pointer list-none items-center rounded-full border border-white/20 px-4 text-xs font-semibold text-white transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-300">
              {locale === "zh" ? "菜单" : "Menu"}
            </summary>
            <nav
              aria-label="Mobile primary"
              className="absolute right-0 top-[calc(100%+0.75rem)] w-64 overflow-hidden rounded-2xl border border-white/10 bg-slate-950 p-2 shadow-[0_24px_80px_rgba(2,6,23,0.45)]"
            >
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex min-h-11 items-center rounded-xl px-4 text-sm text-slate-100 transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-300"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
