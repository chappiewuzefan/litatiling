import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { GuideCard } from "@/components/guide-card";
import { JsonLd } from "@/components/json-ld";
import { QuoteCta } from "@/components/quote-cta";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getContent } from "@/lib/content";
import { getGuidePath, getGuides } from "@/lib/guides";
import { buildMetadata } from "@/lib/metadata";
import { isLocale } from "@/lib/site-config";
import { servicePageUi } from "@/lib/service-pages";
import { buildCollectionStructuredData } from "@/lib/structured-data";

type PageProps = { params: Promise<{ locale: string }> };

const guideUi = {
  en: {
    eyebrow: "Tiling advice for Canberra homes",
    title: "Practical guides for planning tile and wet-area work.",
    description:
      "Clear, Australia-checked guidance on waterproofing, tile choices, preparation, repairs and the questions worth resolving before work begins.",
  },
  zh: {
    eyebrow: "面向堪培拉住宅的贴砖指南",
    title: "在开工前，把贴砖和湿区问题先弄明白。",
    description:
      "围绕防水、选砖、基层、维修和施工准备提供经过澳洲资料复核的实用说明。",
  },
} as const;

async function resolveLocale(params: PageProps["params"]) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return locale;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const ui = guideUi[locale];
  return buildMetadata({
    locale,
    path: "/guides",
    title: ui.title,
    description: ui.description,
  });
}

export default async function GuidesPage({ params }: PageProps) {
  const locale = await resolveLocale(params);
  const content = getContent(locale);
  const ui = guideUi[locale];
  const guides = getGuides(locale);
  const serviceUi = servicePageUi[locale];
  const structuredData = buildCollectionStructuredData({
    locale,
    path: "/guides",
    name: ui.title,
    description: ui.description,
    items: guides.map((guide) => ({
      name: guide.title,
      path: getGuidePath(guide),
    })),
  });
  return (
    <>
      <JsonLd data={structuredData} />
      <SiteHeader locale={locale} labels={content.nav} currentPath="/guides" />
      <main id="main-content">
        <section className="overflow-hidden bg-slate-950 py-20 text-white sm:py-24">
          <div className="section-shell relative">
            <div className="absolute -left-32 top-0 h-72 w-72 rounded-full bg-orange-500/15 blur-3xl" />
            <div className="relative max-w-4xl">
              <p className="section-eyebrow text-sky-300">{ui.eyebrow}</p>
              <h1 className="mt-5 font-heading text-4xl font-semibold leading-tight tracking-[-0.035em] text-white sm:text-6xl">
                {ui.title}
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
                {ui.description}
              </p>
            </div>
          </div>
        </section>
        <section className="section-shell py-16 sm:py-20">
          <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
            {guides.map((guide) => (
              <GuideCard key={guide.slug} guide={guide} />
            ))}
          </div>
          <div className="mt-14">
            <QuoteCta
              locale={locale}
              title={serviceUi.ctaTitle}
              description={serviceUi.ctaDescription}
              primaryLabel={serviceUi.requestQuote}
            />
          </div>
        </section>
      </main>
      <SiteFooter locale={locale} footer={content.footer} />
    </>
  );
}
