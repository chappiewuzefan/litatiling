import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/json-ld";
import { QuoteCta } from "@/components/quote-cta";
import { ServiceCard } from "@/components/service-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getContent } from "@/lib/content";
import { buildMetadata } from "@/lib/metadata";
import { getLocalizedPath, isLocale } from "@/lib/site-config";
import { getServicePages, servicePageUi } from "@/lib/service-pages";
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
  const ui = servicePageUi[locale];
  return buildMetadata({
    locale,
    path: "/services",
    title: ui.indexTitle,
    description: ui.indexDescription,
  });
}

export default async function ServicesPage({ params }: PageProps) {
  const locale = await resolveLocale(params);
  const content = getContent(locale);
  const ui = servicePageUi[locale];
  const services = getServicePages(locale);
  const structuredData = buildCollectionStructuredData({
    locale,
    path: "/services",
    name: ui.indexTitle,
    description: ui.indexDescription,
    items: services.map((service) => ({
      name: service.name,
      path: getLocalizedPath(locale, `/services/${service.slug}`),
    })),
  });

  return (
    <>
      <JsonLd data={structuredData} />
      <SiteHeader
        locale={locale}
        labels={content.nav}
        currentPath="/services"
      />
      <main id="main-content">
        <section className="overflow-hidden bg-[var(--surface-muted)] py-20 sm:py-24">
          <div className="section-shell relative">
            <div className="absolute -right-20 -top-32 h-80 w-80 rounded-full bg-[var(--accent)]/10 blur-3xl" />
            <div className="relative max-w-4xl space-y-5">
              <p className="section-eyebrow">{ui.indexEyebrow}</p>
              <h1 className="font-heading text-4xl font-semibold leading-tight tracking-[-0.035em] text-[var(--ink)] sm:text-6xl">
                {ui.indexTitle}
              </h1>
              <p className="max-w-3xl text-lg leading-8 text-[var(--muted)]">
                {ui.indexDescription}
              </p>
            </div>
          </div>
        </section>
        <section className="section-shell py-16 sm:py-20">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {services.map((service) => (
              <ServiceCard
                key={service.slug}
                service={service}
                label={ui.learnMore}
              />
            ))}
          </div>
          <div className="mt-14">
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
