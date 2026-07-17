import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { GuideCard } from "@/components/guide-card";
import { JsonLd } from "@/components/json-ld";
import { QuoteCta } from "@/components/quote-cta";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getContent } from "@/lib/content";
import { getGuides } from "@/lib/guides";
import { buildMetadata } from "@/lib/metadata";
import { getLocalizedPath, isLocale, locales } from "@/lib/site-config";
import {
  getServicePage,
  servicePageUi,
  serviceSlugs,
} from "@/lib/service-pages";
import { buildServiceStructuredData } from "@/lib/structured-data";

type PageProps = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    serviceSlugs.map((slug) => ({ locale, slug })),
  );
}

async function resolvePage(params: PageProps["params"]) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const service = getServicePage(locale, slug);
  if (!service) notFound();
  return { locale, service };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale, service } = await resolvePage(params);
  return buildMetadata({
    locale,
    path: `/services/${service.slug}`,
    title: service.metadataTitle,
    description: service.description,
    image: service.heroImage,
  });
}

function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="mt-5 space-y-3">
      {items.map((item) => (
        <li
          key={item}
          className="flex items-start gap-3 text-sm leading-7 text-slate-700"
        >
          <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-orange-500" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default async function ServiceDetailPage({ params }: PageProps) {
  const { locale, service } = await resolvePage(params);
  const content = getContent(locale);
  const ui = servicePageUi[locale];
  const relatedGuides = getGuides(locale).filter((guide) =>
    service.relatedGuideKeys.includes(guide.translationKey),
  );
  const structuredData = buildServiceStructuredData(service);
  const homeLabel = locale === "zh" ? "首页" : "Home";

  return (
    <>
      <JsonLd data={structuredData} />
      <SiteHeader
        locale={locale}
        labels={content.nav}
        currentPath={`/services/${service.slug}`}
      />
      <main id="main-content">
        <section className="bg-white py-12 sm:py-16">
          <div className="section-shell">
            <Breadcrumbs
              items={[
                { label: homeLabel, href: getLocalizedPath(locale) },
                {
                  label: ui.indexEyebrow,
                  href: getLocalizedPath(locale, "/services"),
                },
                { label: service.name },
              ]}
            />
            <div className="mt-10 grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
              <div>
                <p className="section-eyebrow">{service.eyebrow}</p>
                <h1 className="mt-5 font-heading text-4xl font-semibold leading-tight tracking-[-0.035em] text-slate-950 sm:text-6xl">
                  {service.title}
                </h1>
                <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
                  {service.intro}
                </p>
                <a
                  href={`${getLocalizedPath(locale)}#contact`}
                  className="mt-8 inline-flex min-h-11 items-center rounded-full bg-orange-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-300"
                >
                  {ui.requestQuote}
                </a>
              </div>
              <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] bg-slate-100 shadow-[0_28px_90px_rgba(15,23,42,0.14)]">
                <Image
                  src={service.heroImage}
                  alt={service.description}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="bg-slate-100/80 py-16 sm:py-20">
          <div className="section-shell grid gap-6 lg:grid-cols-3">
            {[
              { title: ui.idealFor, items: service.idealFor },
              { title: ui.scope, items: service.scope },
              { title: ui.quoteFactors, items: service.quoteFactors },
            ].map((section) => (
              <article
                key={section.title}
                className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-[0_20px_60px_rgba(15,23,42,0.05)]"
              >
                <h2 className="font-heading text-2xl font-semibold text-slate-950">
                  {section.title}
                </h2>
                <CheckList items={section.items} />
              </article>
            ))}
          </div>
        </section>

        <section className="section-shell py-16 sm:py-20">
          <p className="section-eyebrow">{ui.process}</p>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {service.process.map((step, index) => (
              <article
                key={step.title}
                className="rounded-[1.75rem] border border-slate-200 bg-white p-6"
              >
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-700">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h2 className="mt-3 font-heading text-2xl font-semibold text-slate-950">
                  {step.title}
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-white py-16 sm:py-20">
          <div className="section-shell max-w-5xl">
            <p className="section-eyebrow">{ui.faq}</p>
            <div className="mt-8 space-y-4">
              {service.faq.map((item, index) => (
                <details
                  key={item.question}
                  open={index === 0}
                  className="group rounded-[1.75rem] border border-slate-200 bg-slate-50 px-6 py-5"
                >
                  <summary className="flex min-h-11 cursor-pointer items-start justify-between gap-4">
                    <span className="font-heading text-xl font-semibold text-slate-950">
                      {item.question}
                    </span>
                    <span
                      aria-hidden="true"
                      className="text-2xl text-sky-700 transition group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <p className="mt-4 text-sm leading-7 text-slate-600">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {relatedGuides.length ? (
          <section className="section-shell py-16 sm:py-20">
            <p className="section-eyebrow">{ui.relatedGuides}</p>
            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {relatedGuides.map((guide) => (
                <GuideCard key={guide.slug} guide={guide} />
              ))}
            </div>
          </section>
        ) : null}

        <section className="section-shell pb-20">
          <QuoteCta
            locale={locale}
            title={ui.ctaTitle}
            description={ui.ctaDescription}
            primaryLabel={ui.requestQuote}
          />
        </section>
      </main>
      <SiteFooter locale={locale} footer={content.footer} />
    </>
  );
}
