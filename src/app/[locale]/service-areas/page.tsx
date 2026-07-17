import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/json-ld";
import { QuoteCta } from "@/components/quote-cta";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getContent } from "@/lib/content";
import { buildMetadata } from "@/lib/metadata";
import { getLocalizedPath, isLocale, siteConfig } from "@/lib/site-config";
import { serviceAreasContent, servicePageUi } from "@/lib/service-pages";
import { buildCollectionStructuredData } from "@/lib/structured-data";

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
  const page = serviceAreasContent[locale];
  return buildMetadata({
    locale,
    path: "/service-areas",
    title: page.metadataTitle,
    description: page.description,
  });
}

export default async function ServiceAreasPage({ params }: PageProps) {
  const locale = await resolveLocale(params);
  const content = getContent(locale);
  const page = serviceAreasContent[locale];
  const ui = servicePageUi[locale];
  const structuredData = buildCollectionStructuredData({
    locale,
    path: "/service-areas",
    name: page.metadataTitle,
    description: page.description,
    items: siteConfig.serviceAreas.map((area) => ({
      name: `${area}, Canberra`,
      path: `${getLocalizedPath(locale, "/service-areas")}#${area.toLowerCase().replaceAll(" ", "-")}`,
    })),
  });
  return (
    <>
      <JsonLd data={structuredData} />
      <SiteHeader
        locale={locale}
        labels={content.nav}
        currentPath="/service-areas"
      />
      <main id="main-content">
        <section className="bg-slate-950 py-20 text-white sm:py-24">
          <div className="section-shell max-w-5xl">
            <p className="section-eyebrow text-sky-300">{page.eyebrow}</p>
            <h1 className="mt-5 font-heading text-4xl font-semibold leading-tight tracking-[-0.035em] text-white sm:text-6xl">
              {page.title}
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
              {page.intro}
            </p>
          </div>
        </section>
        <section className="section-shell py-16 sm:py-20">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {siteConfig.serviceAreas.map((area) => (
              <article
                id={area.toLowerCase().replaceAll(" ", "-")}
                key={area}
                className="scroll-mt-28 rounded-[1.75rem] border border-slate-200 bg-white p-6"
              >
                <span className="h-3 w-3 rounded-full bg-orange-500" />
                <h2 className="mt-4 font-heading text-2xl font-semibold text-slate-950">
                  {area}
                </h2>
                <p className="mt-2 text-sm text-slate-500">Canberra, ACT</p>
              </article>
            ))}
          </div>
          <div className="mt-12 rounded-[2rem] border border-sky-200 bg-sky-50 p-7">
            <h2 className="font-heading text-2xl font-semibold text-slate-950">
              {page.beforeContact}
            </h2>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {page.checklist.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-sm leading-7 text-slate-700"
                >
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-sky-600" />
                  {item}
                </li>
              ))}
            </ul>
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
