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
    <aside className="rounded-[2rem] border border-sky-400/20 bg-slate-950 p-7 text-white shadow-[0_28px_90px_rgba(2,6,23,0.20)] sm:p-9">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-300">
        LITA Tiling Canberra
      </p>
      <h2 className="mt-4 font-heading text-3xl font-semibold leading-tight text-white">
        {title}
      </h2>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
        {description}
      </p>
      <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Link
          href={`${getLocalizedPath(locale)}#contact`}
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-orange-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-300"
        >
          {primaryLabel}
        </Link>
        {siteConfig.phoneContacts.map((phone) => (
          <a
            key={phone.kind}
            href={phone.href}
            className={`inline-flex min-h-11 items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 ${
              phone.kind === "primary"
                ? "bg-white text-slate-950 hover:bg-slate-100 focus-visible:outline-white"
                : "border border-white/25 text-white hover:bg-white/10 focus-visible:outline-sky-300"
            }`}
          >
            {phoneLabels[phone.kind].action} · {phone.display}
          </a>
        ))}
      </div>
    </aside>
  );
}
