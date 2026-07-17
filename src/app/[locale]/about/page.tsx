import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/json-ld";
import { QuoteCta } from "@/components/quote-cta";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getContent } from "@/lib/content";
import { buildMetadata } from "@/lib/metadata";
import { isLocale } from "@/lib/site-config";
import { aboutPageContent, servicePageUi } from "@/lib/service-pages";
import { buildAboutStructuredData } from "@/lib/structured-data";

type PageProps = { params: Promise<{ locale: string }> };
async function resolveLocale(params: PageProps["params"]) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return locale;
}
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const page = aboutPageContent[locale];
  return buildMetadata({
    locale,
    path: "/about",
    title: page.metadataTitle,
    description: page.description,
    image: "/case-studies/selected/process/floor-installation.webp",
  });
}

export default async function AboutPage({ params }: PageProps) {
  const locale = await resolveLocale(params);
  const content = getContent(locale);
  const page = aboutPageContent[locale];
  const ui = servicePageUi[locale];
  const structuredData = buildAboutStructuredData({
    locale,
    name: page.metadataTitle,
    description: page.description,
  });
  return (
    <>
      <JsonLd data={structuredData} />
      <SiteHeader locale={locale} labels={content.nav} currentPath="/about" />
      <main id="main-content">
        <section className="section-shell grid gap-10 py-16 lg:grid-cols-[1fr_0.85fr] lg:items-center lg:py-24">
          <div>
            <p className="section-eyebrow">{page.eyebrow}</p>
            <h1 className="mt-5 font-heading text-4xl font-semibold leading-tight tracking-[-0.035em] text-slate-950 sm:text-6xl">
              {page.title}
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-600">
              {page.intro}
            </p>
          </div>
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-slate-100">
            <Image
              src="/case-studies/selected/process/floor-installation.webp"
              alt={
                locale === "zh"
                  ? "LITA Tiling 住宅地砖施工现场"
                  : "LITA Tiling residential floor tile installation in progress"
              }
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover"
            />
          </div>
        </section>
        <section className="bg-slate-100/80 py-16 sm:py-20">
          <div className="section-shell grid gap-6 md:grid-cols-2">
            {page.principles.map((item) => (
              <article
                key={item.title}
                className="rounded-[2rem] border border-slate-200 bg-white p-7"
              >
                <h2 className="font-heading text-2xl font-semibold text-slate-950">
                  {item.title}
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </section>
        <section className="section-shell py-16 sm:py-20">
          <h2 className="section-title">
            {locale === "zh" ? "主要项目类型" : "Main project types"}
          </h2>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {page.projectTypes.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-800"
              >
                {item}
              </div>
            ))}
          </div>
          <div className="mt-12">
            <QuoteCta
              locale={locale}
              title={ui.ctaTitle}
              description={ui.ctaDescription}
              primaryLabel={ui.requestQuote}
            />
          </div>
        </section>
      </main>
      <SiteFooter locale={locale} footer={content.footer} />
    </>
  );
}
