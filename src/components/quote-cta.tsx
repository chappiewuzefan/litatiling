import Link from "next/link";

import {
  getLocalizedPath,
  getPhoneLabels,
  siteConfig,
  type Locale,
} from "@/lib/site-config";

type QuoteCtaProps = {
  locale: Locale;
  title: string;
  description: string;
  primaryLabel: string;
};

export function QuoteCta({
  locale,
  title,
  description,
  primaryLabel,
}: QuoteCtaProps) {
  const phoneLabels = getPhoneLabels(locale);

  return (
    <aside className="rounded-[2rem] border border-[var(--accent)]/30 bg-[var(--accent-soft)] p-7 text-[var(--ink)] shadow-[var(--shadow-soft)] sm:p-9">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)]">
        LITA Tiling Canberra
      </p>
      <h2 className="mt-4 font-heading text-3xl font-semibold leading-tight text-[var(--ink)]">
        {title}
      </h2>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--ink-soft)]">
        {description}
      </p>
      <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Link
          href={`${getLocalizedPath(locale)}#contact`}
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-[#251208] transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-strong)]"
        >
          {primaryLabel}
        </Link>
        {siteConfig.phoneContacts.map((phone) => (
          <a
            key={phone.kind}
            href={phone.href}
            className={`inline-flex min-h-11 items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 ${
              phone.kind === "primary"
                ? "bg-[var(--surface)] text-[var(--ink)] hover:-translate-y-0.5 focus-visible:outline-[var(--accent)]"
                : "border border-[var(--line)] bg-[var(--surface)]/70 text-[var(--ink)] hover:-translate-y-0.5 focus-visible:outline-[var(--accent)]"
            }`}
          >
            {phoneLabels[phone.kind].action} · {phone.display}
          </a>
        ))}
      </div>
    </aside>
  );
}
