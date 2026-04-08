import Link from "next/link";

import { LocaleSwitcher } from "@/components/locale-switcher";
import { getLocalizedPath, siteConfig, type Locale } from "@/lib/site-config";

type SiteHeaderProps = {
  locale: Locale;
  currentPath?: string;
  labels: {
    services: string;
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
  isHome = false,
}: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="min-w-0">
          <Link
            href={getLocalizedPath(locale)}
            className="font-heading text-base font-semibold tracking-[0.02em] text-white sm:text-lg"
          >
            {siteConfig.brandName}
          </Link>
          <p className="mt-1 text-xs text-slate-300">
            {siteConfig.primaryCity}, {siteConfig.region} · {siteConfig.phoneDisplay}
          </p>
        </div>

        <div className="hidden items-center gap-6 lg:flex">
          {isHome ? (
            <nav aria-label="Primary" className="flex items-center gap-5 text-sm">
              <a href="#services" className="text-slate-200 transition hover:text-white">
                {labels.services}
              </a>
              <a href="#projects" className="text-slate-200 transition hover:text-white">
                {labels.projects}
              </a>
              <a href="#process" className="text-slate-200 transition hover:text-white">
                {labels.process}
              </a>
              <a href="#areas" className="text-slate-200 transition hover:text-white">
                {labels.areas}
              </a>
              <a href="#faq" className="text-slate-200 transition hover:text-white">
                {labels.faq}
              </a>
              <a href="#contact" className="text-slate-200 transition hover:text-white">
                {labels.contact}
              </a>
            </nav>
          ) : (
            <Link
              href={getLocalizedPath(locale)}
              className="text-sm text-slate-200 transition hover:text-white"
            >
              {labels.backHome}
            </Link>
          )}
          <LocaleSwitcher locale={locale} path={currentPath} />
        </div>

        <div className="flex items-center gap-3 lg:hidden">
          <a
            href="#contact"
            className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/10"
          >
            {labels.contact}
          </a>
          <LocaleSwitcher locale={locale} path={currentPath} />
        </div>
      </div>
    </header>
  );
}
