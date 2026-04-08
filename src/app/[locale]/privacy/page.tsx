import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LaunchWarning } from "@/components/launch-warning";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getContent } from "@/lib/content";
import { buildMetadata } from "@/lib/metadata";
import { hasPlaceholderContent, isLocale, siteConfig } from "@/lib/site-config";

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

  return buildMetadata({
    locale,
    path: "/privacy",
    title:
      locale === "zh"
        ? `隐私说明 | ${siteConfig.brandName}`
        : `Privacy | ${siteConfig.brandName}`,
    description: content.privacy.intro,
    keywords: content.metadata.keywords,
  });
}

export default async function PrivacyPage({ params }: LocalePageProps) {
  const locale = await resolveLocale(params);
  const content = getContent(locale);

  return (
    <>
      {hasPlaceholderContent() ? (
        <LaunchWarning message={content.common.placeholderBanner} />
      ) : null}
      <SiteHeader locale={locale} labels={content.nav} currentPath="/privacy" />
      <main id="main-content" className="section-shell py-20">
        <div className="max-w-4xl space-y-10">
          <div className="space-y-5">
            <p className="section-eyebrow">{content.nav.privacy}</p>
            <h1 className="section-title">{content.privacy.title}</h1>
            <p className="section-copy">{content.privacy.intro}</p>
          </div>

          <div className="space-y-6">
            {content.privacy.sections.map((section) => (
              <section
                key={section.title}
                className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-[0_24px_70px_rgba(15,23,42,0.04)]"
              >
                <h2 className="font-heading text-2xl font-semibold text-slate-950">
                  {section.title}
                </h2>
                <div className="mt-4 space-y-4 text-sm leading-7 text-slate-700">
                  {section.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter locale={locale} footer={content.footer} />
    </>
  );
}
