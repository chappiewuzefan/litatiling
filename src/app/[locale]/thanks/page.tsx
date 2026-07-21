import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { FloatingCallButton } from "@/components/floating-call-button";
import { LaunchWarning } from "@/components/launch-warning";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getContent } from "@/lib/content";
import { buildMetadata } from "@/lib/metadata";
import {
  getLocalizedPath,
  getPhoneLabels,
  hasPlaceholderContent,
  isLocale,
  siteConfig,
} from "@/lib/site-config";

type LocalePageProps = {
  params: Promise<{ locale: string }>;
};

async function resolveLocale(params: Promise<{ locale: string }>) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return locale;
}

export async function generateMetadata({
  params,
}: LocalePageProps): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const content = getContent(locale);

  const metadata = buildMetadata({
    locale,
    path: "/thanks",
    title:
      locale === "zh"
        ? `已收到询价 | ${siteConfig.brandName}`
        : `Thanks for your quote request | ${siteConfig.brandName}`,
    description: content.thanks.description,
  });

  return {
    ...metadata,
    robots: { index: false, follow: true },
  };
}

export default async function ThanksPage({ params }: LocalePageProps) {
  const locale = await resolveLocale(params);
  const content = getContent(locale);
  const phoneLabels = getPhoneLabels(locale);

  return (
    <>
      {hasPlaceholderContent() ? (
        <LaunchWarning message={content.common.placeholderBanner} />
      ) : null}
      <SiteHeader locale={locale} labels={content.nav} currentPath="/thanks" />
      <main id="main-content" className="section-shell py-20">
        <div className="mx-auto max-w-4xl rounded-[2.25rem] border border-slate-200 bg-white p-8 shadow-[0_32px_90px_rgba(15,23,42,0.08)] md:p-12">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-2xl font-bold text-orange-600">
            ✓
          </div>
          <h1 className="mt-6 font-heading text-4xl font-semibold text-slate-950 sm:text-5xl">
            {content.thanks.title}
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
            {content.thanks.description}
          </p>

          <ul className="mt-8 space-y-4">
            {content.thanks.nextSteps.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 rounded-[1.5rem] bg-slate-50 px-5 py-4 text-sm leading-7 text-slate-700"
              >
                <span className="mt-2 h-2 w-2 rounded-full bg-sky-600" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
            <Link
              href={getLocalizedPath(locale)}
              className="inline-flex items-center justify-center rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              {content.thanks.primaryCta}
            </Link>
            {siteConfig.phoneContacts.map((phone) => (
              <a
                key={phone.kind}
                href={phone.href}
                className={`inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition ${
                  phone.kind === "primary"
                    ? "bg-orange-700 text-white hover:bg-orange-600"
                    : "border border-slate-300 text-slate-900 hover:bg-slate-100"
                }`}
              >
                {phoneLabels[phone.kind].action} · {phone.display}
              </a>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter locale={locale} footer={content.footer} />
      <FloatingCallButton locale={locale} />
    </>
  );
}
