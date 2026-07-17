import Link from "next/link";

import { getLocalizedPath, type Locale } from "@/lib/site-config";

type LocaleSwitcherProps = {
  locale: Locale;
  path?: string;
};

export function LocaleSwitcher({ locale, path = "" }: LocaleSwitcherProps) {
  const zhHref = getLocalizedPath("zh", path);
  const enHref = getLocalizedPath("en", path);

  return (
    <nav
      aria-label="Language"
      className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-slate-950/70 p-1 text-xs font-medium text-slate-200 shadow-lg shadow-slate-950/15 backdrop-blur"
    >
      <Link
        href={enHref}
        className={`inline-flex min-h-11 items-center rounded-full px-3 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-300 ${
          locale === "en"
            ? "bg-orange-700 text-white"
            : "text-slate-300 hover:bg-white/10 hover:text-white"
        }`}
      >
        EN
      </Link>
      <Link
        href={zhHref}
        className={`inline-flex min-h-11 items-center rounded-full px-3 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-300 ${
          locale === "zh"
            ? "bg-orange-700 text-white"
            : "text-slate-300 hover:bg-white/10 hover:text-white"
        }`}
      >
        中文
      </Link>
    </nav>
  );
}
