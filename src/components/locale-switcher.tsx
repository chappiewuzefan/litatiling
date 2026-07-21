import Link from "next/link";
import React from "react";

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
      className="inline-flex items-center gap-0.5 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-0.5 text-xs font-semibold text-[var(--muted)]"
    >
      <Link
        prefetch={false}
        href={enHref}
        aria-current={locale === "en" ? "page" : undefined}
        className={`inline-flex min-h-11 items-center rounded-[0.625rem] px-3 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)] ${
          locale === "en"
            ? "bg-[var(--accent-soft)] text-[var(--accent-strong)]"
            : "text-[var(--muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--ink)]"
        }`}
      >
        EN
      </Link>
      <Link
        prefetch={false}
        href={zhHref}
        aria-current={locale === "zh" ? "page" : undefined}
        className={`inline-flex min-h-11 items-center rounded-[0.625rem] px-3 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)] ${
          locale === "zh"
            ? "bg-[var(--accent-soft)] text-[var(--accent-strong)]"
            : "text-[var(--muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--ink)]"
        }`}
      >
        中文
      </Link>
    </nav>
  );
}
