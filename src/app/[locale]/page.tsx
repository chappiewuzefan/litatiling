import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { ContactForm } from "@/components/contact-form";
import { FloatingCallButton } from "@/components/floating-call-button";
import { JsonLd } from "@/components/json-ld";
import { LaunchWarning } from "@/components/launch-warning";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getContent } from "@/lib/content";
import { heroGallery, processGallery, projectGallery } from "@/lib/gallery";
import { buildMetadata } from "@/lib/metadata";
import {
  hasPlaceholderContent,
  isLocale,
  siteConfig,
} from "@/lib/site-config";
import { buildStructuredData } from "@/lib/structured-data";

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
    title: content.metadata.title,
    description: content.metadata.description,
    keywords: content.metadata.keywords,
  });
}

function ServiceLinks({ labels }: { labels: string[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 text-sm text-slate-200 sm:grid-cols-3">
      {labels.map((item, index) => (
        <div
          key={item}
          className={`rounded-3xl border border-white/10 px-4 py-4 ${
            index % 2 === 0 ? "bg-white/8" : "bg-sky-500/10"
          }`}
        >
          {item}
        </div>
      ))}
    </div>
  );
}

export default async function LocalePage({ params }: LocalePageProps) {
  const locale = await resolveLocale(params);
  const content = getContent(locale);
  const structuredData = buildStructuredData(locale);
  const showPlaceholderWarning = hasPlaceholderContent();
  const contactPath = `/${locale}`;

  return (
    <>
      <JsonLd data={structuredData} />
      {showPlaceholderWarning ? (
        <LaunchWarning message={content.common.placeholderBanner} />
      ) : null}
      <SiteHeader locale={locale} labels={content.nav} currentPath="" isHome />

      <main id="main-content">
        <section className="relative overflow-hidden bg-slate-950 text-white">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(45deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:72px_72px]" />
          <div className="absolute right-[-6rem] top-16 h-72 w-72 rounded-full bg-orange-500/20 blur-3xl" />
          <div className="absolute bottom-[-8rem] left-[-8rem] h-80 w-80 rounded-full bg-sky-500/20 blur-3xl" />
          <div className="section-shell relative grid gap-14 py-20 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:py-28">
            <div className="space-y-8">
              <div className="space-y-5">
                <p className="section-eyebrow text-sky-300">
                  {content.hero.eyebrow}
                </p>
                <h1 className="font-heading max-w-4xl text-5xl font-semibold tracking-[-0.04em] text-white sm:text-6xl">
                  {content.hero.title}
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-slate-200">
                  {content.hero.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                {content.hero.badges.map((badge) => (
                  <span
                    key={badge}
                    className="rounded-full border border-white/15 bg-white/8 px-4 py-2 text-sm text-slate-100"
                  >
                    {badge}
                  </span>
                ))}
              </div>

              <div className="flex flex-col gap-4 sm:flex-row">
                <a
                  href="#contact"
                  className="inline-flex items-center justify-center rounded-full bg-orange-500 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-orange-400"
                >
                  {content.hero.primaryCta}
                </a>
                <a
                  href="#services"
                  className="inline-flex items-center justify-center rounded-full border border-white/15 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  {content.hero.secondaryCta}
                </a>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {content.hero.stats.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-[1.75rem] border border-white/10 bg-white/6 px-5 py-5 shadow-[0_20px_50px_rgba(2,6,23,0.24)]"
                  >
                    <p className="font-heading text-2xl font-semibold text-white">
                      {item.value}
                    </p>
                    <p className="mt-1 text-sm text-slate-300">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-x-8 bottom-0 top-10 rounded-[2rem] bg-sky-500/10 blur-2xl" />
              <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/8 p-6 shadow-[0_30px_100px_rgba(2,6,23,0.35)] backdrop-blur">
                <div className="space-y-6">
                  <div className="grid gap-3 sm:grid-cols-[1.15fr_0.85fr]">
                    <div className="relative min-h-[320px] overflow-hidden rounded-[1.75rem] border border-white/10 sm:row-span-2">
                      <Image
                        src={heroGallery[0].src}
                        alt={heroGallery[0].alt[locale]}
                        fill
                        priority
                        sizes="(max-width: 1024px) 100vw, 28vw"
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent" />
                    </div>
                    <div className="relative min-h-[150px] overflow-hidden rounded-[1.75rem] border border-white/10">
                      <Image
                        src={heroGallery[1].src}
                        alt={heroGallery[1].alt[locale]}
                        fill
                        sizes="(max-width: 1024px) 50vw, 18vw"
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-transparent to-transparent" />
                    </div>
                    <div className="relative min-h-[150px] overflow-hidden rounded-[1.75rem] border border-white/10">
                      <Image
                        src={heroGallery[2].src}
                        alt={heroGallery[2].alt[locale]}
                        fill
                        sizes="(max-width: 1024px) 50vw, 18vw"
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-transparent to-transparent" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-300">
                      {content.hero.panelTitle}
                    </p>
                    <p className="text-sm leading-7 text-slate-200">
                      {content.hero.panelDescription}
                    </p>
                  </div>

                  <div className="space-y-3">
                    {content.hero.panelPoints.map((point) => (
                      <div
                        key={point}
                        className="flex items-start gap-3 rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-3 text-sm text-slate-100"
                      >
                        <span className="mt-1 h-2.5 w-2.5 rounded-full bg-orange-400" />
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>

                  <ServiceLinks
                    labels={content.services.items.map((service) => service.title)}
                  />

                  <div className="grid gap-3 sm:grid-cols-2">
                    <a
                      href={siteConfig.phoneHref}
                      className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
                    >
                      {content.common.callNow}
                    </a>
                    <a
                      href={siteConfig.emailHref}
                      className="inline-flex items-center justify-center rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                    >
                      {content.common.emailUs}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section-shell py-20">
          <div className="space-y-5">
            <p className="section-eyebrow">{content.trust.eyebrow}</p>
            <h2 className="section-title">{content.trust.title}</h2>
            <p className="section-copy">{content.trust.description}</p>
          </div>
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {content.trust.items.map((item) => (
              <article
                key={item.title}
                className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-[0_24px_70px_rgba(15,23,42,0.06)]"
              >
                <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-100 text-sm font-bold text-orange-600">
                  {item.title.slice(0, 1)}
                </div>
                <h3 className="font-heading text-2xl font-semibold text-slate-950">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section id="services" className="bg-slate-100/80 py-20">
          <div className="section-shell">
            <div className="space-y-5">
              <p className="section-eyebrow">{content.services.eyebrow}</p>
              <h2 className="section-title">{content.services.title}</h2>
              <p className="section-copy">{content.services.description}</p>
            </div>
            <div className="mt-10 grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
              {content.services.items.map((service) => (
                <article
                  key={service.title}
                  className="group rounded-[2rem] border border-slate-200 bg-white p-7 shadow-[0_24px_70px_rgba(15,23,42,0.04)] transition hover:-translate-y-1 hover:shadow-[0_28px_80px_rgba(15,23,42,0.1)]"
                >
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="font-heading text-2xl font-semibold text-slate-950">
                      {service.title}
                    </h3>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
                      <span className="h-2.5 w-2.5 rounded-full bg-sky-600" />
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {service.description}
                  </p>
                  <ul className="mt-6 space-y-3 text-sm text-slate-700">
                    {service.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-3">
                        <span className="mt-2 h-2 w-2 rounded-full bg-orange-500" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="projects" className="section-shell py-20">
          <div className="space-y-5">
            <p className="section-eyebrow">{content.projects.eyebrow}</p>
            <h2 className="section-title">{content.projects.title}</h2>
            <p className="section-copy">{content.projects.description}</p>
            <div className="rounded-2xl border border-sky-200 bg-sky-50 px-5 py-4 text-sm text-sky-900">
              {content.projects.notice}
            </div>
          </div>
          <div className="mt-10 grid gap-6 xl:grid-cols-2">
            {content.projects.items.map((project, index) => (
              <article
                key={`${project.suburb}-${project.title}`}
                className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_26px_80px_rgba(15,23,42,0.05)]"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-950">
                  <Image
                    src={projectGallery[index].src}
                    alt={projectGallery[index].alt[locale]}
                    fill
                    sizes="(max-width: 1280px) 100vw, 45vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-300">
                      {project.suburb}
                    </p>
                    <h3 className="mt-2 font-heading text-2xl font-semibold">
                      {project.title}
                    </h3>
                  </div>
                </div>
                <div className="space-y-5 p-7">
                  <p className="text-sm leading-7 text-slate-600">{project.summary}</p>
                  <div className="rounded-[1.5rem] bg-slate-50 p-5 text-sm leading-7 text-slate-700">
                    {project.result}
                  </div>
                  <ul className="space-y-3 text-sm text-slate-700">
                    {project.highlights.map((highlight) => (
                      <li key={highlight} className="flex items-start gap-3">
                        <span className="mt-2 h-2 w-2 rounded-full bg-orange-500" />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="process" className="bg-white py-20">
          <div className="section-shell">
            <div className="space-y-5">
              <p className="section-eyebrow">{content.process.eyebrow}</p>
              <h2 className="section-title">{content.process.title}</h2>
              <p className="section-copy">{content.process.description}</p>
            </div>
            <div className="mt-10 grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
              <div className="grid gap-6 lg:grid-cols-2">
                {content.process.steps.map((step) => (
                  <article
                    key={step.title}
                    className="rounded-[2rem] border border-slate-200 bg-slate-50 p-7"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
                      {step.title}
                    </p>
                    <p className="mt-4 text-sm leading-7 text-slate-700">
                      {step.description}
                    </p>
                  </article>
                ))}
              </div>

              <aside className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.06)]">
                <div className="relative aspect-[4/5] overflow-hidden">
                  <Image
                    src={processGallery.src}
                    alt={processGallery.alt[locale]}
                    fill
                    sizes="(max-width: 1280px) 100vw, 32vw"
                    className="object-cover"
                  />
                </div>
                <div className="space-y-3 p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
                    {content.process.spotlightTitle}
                  </p>
                  <p className="text-sm leading-7 text-slate-700">
                    {content.process.spotlightDescription}
                  </p>
                </div>
              </aside>
            </div>
          </div>
        </section>

        <section id="areas" className="bg-slate-950 py-20 text-white">
          <div className="section-shell grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div className="space-y-5">
              <p className="section-eyebrow text-sky-300">{content.areas.eyebrow}</p>
              <h2 className="font-heading text-4xl font-semibold tracking-[-0.03em] text-white sm:text-5xl">
                {content.areas.title}
              </h2>
              <p className="max-w-xl text-lg leading-8 text-slate-300">
                {content.areas.description}
              </p>
            </div>
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                {siteConfig.serviceAreas.map((area) => (
                  <div
                    key={area}
                    className="rounded-[1.75rem] border border-white/10 bg-white/6 px-5 py-5"
                  >
                    <p className="font-heading text-2xl font-semibold text-white">
                      {area}
                    </p>
                    <p className="mt-1 text-sm text-slate-300">
                      {siteConfig.primaryCity}, {siteConfig.region}
                    </p>
                  </div>
                ))}
              </div>
              <p className="rounded-[1.75rem] border border-sky-400/20 bg-sky-500/10 px-5 py-4 text-sm leading-7 text-slate-200">
                {content.areas.coverageNote}
              </p>
            </div>
          </div>
        </section>

        <section id="faq" className="section-shell py-20">
          <div className="space-y-5">
            <p className="section-eyebrow">{content.faq.eyebrow}</p>
            <h2 className="section-title">{content.faq.title}</h2>
            <p className="section-copy">{content.faq.description}</p>
          </div>
          <div className="mt-10 space-y-4">
            {content.faq.items.map((item, index) => (
              <details
                key={item.question}
                className="group rounded-[1.75rem] border border-slate-200 bg-white px-6 py-5 shadow-[0_18px_60px_rgba(15,23,42,0.04)]"
                open={index === 0}
              >
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
                  <span className="font-heading text-xl font-semibold text-slate-950">
                    {item.question}
                  </span>
                  <span className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-lg text-slate-700 transition group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-600">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </section>

        <section
          id="contact"
          className="bg-[linear-gradient(180deg,rgba(255,255,255,0),rgba(224,242,254,0.5))] py-20"
        >
          <div className="section-shell grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div className="space-y-6">
              <div className="space-y-5">
                <p className="section-eyebrow">{content.contact.eyebrow}</p>
                <h2 className="section-title">{content.contact.title}</h2>
                <p className="section-copy">{content.contact.description}</p>
              </div>

              <div className="grid gap-4">
                {content.contact.cards.map((card) => (
                  <article
                    key={card.title}
                    className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
                      {card.title}
                    </p>
                    <p className="mt-2 font-heading text-2xl font-semibold text-slate-950">
                      {card.body}
                    </p>
                    {card.href && card.action ? (
                      <a
                        href={card.href}
                        className="mt-4 inline-flex items-center rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                      >
                        {card.action}
                      </a>
                    ) : null}
                  </article>
                ))}
              </div>
            </div>

            <ContactForm locale={locale} content={content.contact.form} sourcePage={contactPath} />
          </div>
        </section>
      </main>

      <SiteFooter locale={locale} footer={content.footer} />
      <FloatingCallButton label={content.common.callNow} />
    </>
  );
}
