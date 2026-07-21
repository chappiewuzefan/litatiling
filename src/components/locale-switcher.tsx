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
      className="inline-flex items-center gap-1 rounded-full border border-[var(--line)] bg-[var(--surface-muted)] p-1 text-xs font-medium text-[var(--muted)]"
    >
      <Link
        prefetch={false}
        href={enHref}
        className={`inline-flex min-h-11 items-center rounded-full px-3 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)] ${
          locale === "en"
            ? "bg-[var(--accent)] text-[#251208]"
            : "text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--ink)]"
        }`}
      >
        EN
      </Link>
      <Link
        prefetch={false}
        href={zhHref}
        className={`inline-flex min-h-11 items-center rounded-full px-3 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)] ${
          locale === "zh"
            ? "bg-[var(--accent)] text-[#251208]"
            : "text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--ink)]"
        }`}
      >
        中文
      </Link>
    </nav>
  );
}
