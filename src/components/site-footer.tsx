import Link from "next/link";

import { getLocalizedPath, siteConfig, type Locale } from "@/lib/site-config";

type SiteFooterProps = {
  locale: Locale;
  footer: {
    tagline: string;
    rights: string;
    home: string;
    privacy: string;
  };
};

export function SiteFooter({ locale, footer }: SiteFooterProps) {
  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-slate-200">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.4fr_1fr] lg:px-8">
        <div className="space-y-3">
          <p className="font-heading text-xl text-white">{siteConfig.brandName}</p>
          <p className="max-w-xl text-sm leading-6 text-slate-300">
            {footer.tagline}
          </p>
          <div className="flex flex-wrap gap-3 text-sm">
            <a href={siteConfig.phoneHref} className="transition hover:text-white">
              {siteConfig.phoneDisplay}
            </a>
            <span className="text-slate-500">•</span>
            <a href={siteConfig.emailHref} className="transition hover:text-white">
              {siteConfig.email}
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-3 text-sm">
          <Link href={getLocalizedPath(locale)} className="transition hover:text-white">
            {footer.home}
          </Link>
          <Link
            href={getLocalizedPath(locale, "/privacy")}
            className="transition hover:text-white"
          >
            {footer.privacy}
          </Link>
          <p className="pt-3 text-slate-400">{footer.rights}</p>
        </div>
      </div>
    </footer>
  );
}
