import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ContactForm } from "@/components/contact-form";
import { FloatingCallButton } from "@/components/floating-call-button";
import { HeroCarousel } from "@/components/hero-carousel";
import { HomeMotionLoader } from "@/components/home-motion-loader";
import { JsonLd } from "@/components/json-ld";
import { LaunchWarning } from "@/components/launch-warning";
import { ProcessStack } from "@/components/process-stack";
import { ProjectEvidence } from "@/components/project-evidence";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getContent } from "@/lib/content";
import { getFeaturedGuides, getGuidePath } from "@/lib/guides";
import {
  heroCarouselProjectIndexes,
  latestBathroomGallery,
  processGallery,
  projectGallery,
} from "@/lib/gallery";
import { buildMetadata } from "@/lib/metadata";
import {
  getLocalizedPath,
  hasPlaceholderContent,
  isLocale,
  siteConfig,
} from "@/lib/site-config";
import { getServicePages, servicePageUi } from "@/lib/service-pages";
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
    image: projectGallery[0].src,
  });
}

const featuredServiceSlugs = new Set([
  "bathroom-tiling-canberra",
  "waterproofing-canberra",
  "floor-and-wall-tiling-canberra",
  "tile-repairs-regrouting-canberra",
]);

export default async function LocalePage({ params }: LocalePageProps) {
  const locale = await resolveLocale(params);
  const content = getContent(locale);
  const structuredData = buildStructuredData(locale);
  const showPlaceholderWarning = hasPlaceholderContent();
  const servicePages = getServicePages(locale);
  const featuredServices = servicePages.filter((service) =>
    featuredServiceSlugs.has(service.slug),
  );
  const featuredGuides = getFeaturedGuides(locale);
  const serviceUi = servicePageUi[locale];
  const homePath = getLocalizedPath(locale);
  const trustGrid = [
    "lg:col-span-5 lg:row-span-2",
    "lg:col-span-4",
    "lg:col-span-3",
    "lg:col-span-3",
    "lg:col-span-4",
  ];
  const heroSlides = heroCarouselProjectIndexes.map((index) => ({
    image: projectGallery[index],
    title: content.projects.items[index].title,
    location: content.projects.items[index].suburb,
  }));

  return (
    <>
      <JsonLd data={structuredData} />
      {showPlaceholderWarning ? (
        <LaunchWarning message={content.common.placeholderBanner} />
      ) : null}
      <SiteHeader locale={locale} labels={content.nav} currentPath="" isHome />

      <main
        id="main-content"
        data-home-page
        className="w-full max-w-full overflow-x-hidden"
      >
        <section className="home-hero pb-16 sm:pb-24">
          <div className="section-shell grid gap-12 py-12 lg:min-h-[calc(100dvh-72px)] lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16 lg:py-16">
            <div data-hero-copy className="max-w-3xl">
              <p className="section-eyebrow">{content.hero.eyebrow}</p>
              <h1 className="mt-6 font-heading text-[clamp(3rem,5.4vw,5.8rem)] font-semibold leading-[0.94] tracking-[-0.055em] text-[var(--ink)] text-balance">
                {content.hero.title}
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-[var(--muted)] sm:text-xl">
                {content.hero.description}
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <a href="#contact" className="button-primary">
                  {content.hero.primaryCta}
                </a>
                <a href="#projects" className="button-secondary">
                  {content.hero.secondaryCta}
                </a>
              </div>
              <p className="mt-7 flex items-center gap-3 text-sm font-semibold text-[var(--ink-soft)]">
                <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
                {locale === "zh"
                  ? "全部为 LITA 真实住宅项目图片"
                  : "Real LITA residential project photography"}
              </p>
            </div>

            <div
              data-hero-mosaic
              className="grid h-[30rem] grid-cols-[1.08fr_0.92fr] grid-rows-2 gap-3 sm:h-[42rem] sm:gap-4"
            >
              <div
                data-hero-photo
                className="relative row-span-2 overflow-hidden rounded-[2rem] bg-[var(--surface-muted)] shadow-[var(--shadow-image)]"
              >
                <Image
                  src={latestBathroomGallery[0].src}
                  alt={latestBathroomGallery[0].alt[locale]}
                  fill
                  sizes="(max-width: 1024px) 55vw, 31vw"
                  className="object-cover"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
                <p className="absolute inset-x-0 bottom-0 p-5 text-sm font-semibold text-white sm:p-6">
                  {locale === "zh" ? "浴室整体完工效果" : "Finished bathroom composition"}
                </p>
              </div>
              <div
                data-hero-photo
                className="relative overflow-hidden rounded-[1.5rem] bg-[var(--surface-muted)] shadow-[var(--shadow-soft)]"
              >
                <Image
                  src={latestBathroomGallery[1].src}
                  alt={latestBathroomGallery[1].alt[locale]}
                  fill
                  sizes="(max-width: 1024px) 42vw, 24vw"
                  className="object-cover"
                />
              </div>
              <div
                data-hero-photo
                className="relative overflow-hidden rounded-[1.5rem] bg-[var(--surface-muted)] shadow-[var(--shadow-soft)]"
              >
                <Image
                  src={latestBathroomGallery[2].src}
                  alt={latestBathroomGallery[2].alt[locale]}
                  fill
                  sizes="(max-width: 1024px) 42vw, 24vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          <div className="section-shell mt-4 lg:mt-8">
            <HeroCarousel locale={locale} slides={heroSlides} />
          </div>
        </section>

        <nav
          aria-label={locale === "zh" ? "服务快速导航" : "Service shortcuts"}
          className="service-marquee border-y border-[var(--line)] bg-[var(--surface)]"
        >
          <div className="service-marquee-track">
            <div className="service-marquee-group">
              {servicePages.map((service) => (
                <Link
                  key={service.slug}
                  prefetch={false}
                  href={getLocalizedPath(
                    locale,
                    `/services/${service.slug}`,
                  )}
                  className="service-marquee-link"
                >
                  {service.name}
                </Link>
              ))}
            </div>
            <div className="service-marquee-group" aria-hidden="true">
              {servicePages.map((service) => (
                <span
                  key={`repeat-${service.slug}`}
                  className="service-marquee-link"
                >
                  {service.name}
                </span>
              ))}
            </div>
          </div>
        </nav>

        <section className="bg-[var(--page)] py-24 sm:py-32 lg:py-40">
          <div className="section-shell">
            <div className="max-w-4xl">
              <h2 className="section-title">{content.trust.title}</h2>
              <p className="section-copy mt-6">{content.trust.description}</p>
            </div>
            <div className="mt-12 grid grid-flow-dense gap-4 lg:grid-cols-12 lg:grid-rows-2">
              {content.trust.items.map((item, index) => (
                <article
                  key={item.title}
                  className={`${trustGrid[index]} relative min-h-52 overflow-hidden rounded-2xl border border-[var(--line)] ${index === 0 ? "flex min-h-[28rem] items-end" : "bg-[var(--surface)] p-7"}`}
                >
                  {index === 0 ? (
                    <>
                      <Image
                        src={projectGallery[0].src}
                        alt={projectGallery[0].alt[locale]}
                        fill
                        sizes="(max-width: 1024px) 100vw, 42vw"
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />
                      <div className="relative p-7 text-white sm:p-9">
                        <h3 className="font-heading text-3xl font-semibold">
                          {item.title}
                        </h3>
                        <p className="mt-3 max-w-lg text-sm leading-7 text-white/80">
                          {item.description}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <h3 className="font-heading text-2xl font-semibold text-[var(--ink)]">
                        {item.title}
                      </h3>
                      <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
                        {item.description}
                      </p>
                    </>
                  )}
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="services" className="bg-[var(--surface-muted)] py-24 sm:py-32 lg:py-40">
          <div className="section-shell">
            <div className="max-w-4xl">
              <p className="section-eyebrow">{content.services.eyebrow}</p>
              <h2 className="section-title mt-6">{content.services.title}</h2>
              <p className="section-copy mt-6">{content.services.description}</p>
            </div>
            <div className="mt-12 grid gap-4 lg:grid-cols-12">
              {featuredServices.map((service, index) => (
                <article
                  key={service.slug}
                  className={`group overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] transition-transform duration-500 hover:-translate-y-1 ${index === 0 ? "lg:col-span-7 lg:row-span-2" : index === 3 ? "lg:col-span-12 lg:grid lg:grid-cols-[0.9fr_1.1fr]" : "lg:col-span-5"}`}
                >
                  <div
                    data-service-image
                    className={`relative overflow-hidden bg-[var(--surface-muted)] ${index === 0 ? "aspect-[16/11]" : index === 3 ? "aspect-[16/10] lg:aspect-auto lg:min-h-72" : "aspect-[16/9]"}`}
                  >
                    <Image
                      src={service.heroImage}
                      alt={service.description}
                      fill
                      sizes={
                        index === 3
                          ? "(max-width: 1024px) 100vw, 45vw"
                          : "(max-width: 1024px) 100vw, 50vw"
                      }
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  </div>
                  <div className="p-7 sm:p-9">
                    <h3 className={`${index === 0 ? "text-4xl sm:text-5xl" : "text-2xl"} font-heading font-semibold tracking-[-0.03em] text-[var(--ink)]`}>
                      {service.name}
                    </h3>
                    <p className="mt-5 max-w-2xl text-sm leading-7 text-[var(--muted)]">
                      {service.intro}
                    </p>
                    <Link
                      prefetch={false}
                      href={getLocalizedPath(
                        locale,
                        `/services/${service.slug}`,
                      )}
                      className="mt-7 inline-flex min-h-11 items-center font-semibold text-[var(--accent-strong)] underline decoration-[var(--accent)] decoration-2 underline-offset-8"
                    >
                      {serviceUi.learnMore}
                    </Link>
                  </div>
                </article>
              ))}
            </div>
            <Link prefetch={false} href={`/${locale}/services`} className="button-secondary mt-8">
              {locale === "zh" ? "查看全部服务说明" : "Explore all services"}
            </Link>
          </div>
        </section>

        <section id="projects" className="bg-[var(--page)] py-24 sm:py-32 lg:py-40">
          <div className="section-shell">
            <div className="max-w-5xl">
              <h2 className="section-title">
                {locale === "zh" ? (
                  <>
                    真实项目
                    <span className="relative mx-3 inline-block h-[0.72em] w-[1.75em] overflow-hidden rounded-full align-baseline">
                      <Image
                        src={projectGallery[2].src}
                        alt=""
                        fill
                        sizes="160px"
                        className="object-cover"
                      />
                    </span>
                    里的细节和完成效果。
                  </>
                ) : (
                  <>
                    Real project
                    <span className="relative mx-3 inline-block h-[0.72em] w-[1.75em] overflow-hidden rounded-full align-baseline">
                      <Image
                        src={projectGallery[2].src}
                        alt=""
                        fill
                        sizes="160px"
                        className="object-cover"
                      />
                    </span>
                    evidence, not stock promises.
                  </>
                )}
              </h2>
              <p className="section-copy mt-6">{content.projects.description}</p>
            </div>
            <ProjectEvidence
              locale={locale}
              items={content.projects.items}
              images={projectGallery}
            />
          </div>
        </section>

        <section id="process">
          <ProcessStack
            locale={locale}
            steps={content.process.steps}
            image={processGallery}
            title={content.process.title}
            description={content.process.description}
          />
        </section>

        <section id="areas" className="bg-[var(--page)] py-24 sm:py-32 lg:py-40">
          <div className="section-shell grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="max-w-xl">
              <h2 className="section-title">{content.areas.title}</h2>
              <p className="section-copy mt-6">{content.areas.description}</p>
              <p className="mt-6 text-sm leading-7 text-[var(--muted)]">
                {content.areas.coverageNote}
              </p>
              <div
                data-ambient-image
                className="relative mt-9 aspect-[4/3] overflow-hidden rounded-2xl bg-[var(--surface-muted)] shadow-[var(--shadow-soft)]"
              >
                <Image
                  src={latestBathroomGallery[3].src}
                  alt={latestBathroomGallery[3].alt[locale]}
                  fill
                  sizes="(max-width: 1024px) 100vw, 35vw"
                  className="object-cover"
                />
              </div>
            </div>
            <div className="grid content-start gap-x-8 sm:grid-cols-2">
              {siteConfig.serviceAreas.map((area) => (
                <div
                  key={area}
                  className="border-b border-[var(--line)] py-5 font-heading text-2xl font-semibold text-[var(--ink)]"
                >
                  {area}
                </div>
              ))}
            </div>
          </div>
        </section>

        {featuredGuides.length ? (
          <section className="bg-[var(--surface-muted)] py-24 sm:py-32 lg:py-40">
            <div className="section-shell">
              <div className="max-w-4xl">
                <h2 className="section-title">
                  {locale === "zh"
                    ? "开工前，先把关键问题弄明白。"
                    : "Resolve the important questions before work begins."}
                </h2>
                <p className="section-copy mt-6">
                  {locale === "zh"
                    ? "阅读经过澳洲资料复核的防水、选砖、基层、维修和施工准备指南。"
                    : "Read Australia-checked guidance on waterproofing, tile selection, preparation, repairs and project planning."}
                </p>
              </div>
              <div className="mt-12 grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
                <Link
                  prefetch={false}
                  href={getGuidePath(featuredGuides[0])}
                  className="group overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)]"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image
                      src={featuredGuides[0].heroImage}
                      alt={featuredGuides[0].heroAlt}
                      fill
                      sizes="(max-width: 1024px) 100vw, 60vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  </div>
                  <div className="p-7 sm:p-9">
                    <h3 className="font-heading text-3xl font-semibold leading-tight text-[var(--ink)] sm:text-4xl">
                      {featuredGuides[0].title}
                    </h3>
                    <p className="mt-5 text-sm leading-7 text-[var(--muted)]">
                      {featuredGuides[0].excerpt}
                    </p>
                  </div>
                </Link>
                <div className="flex flex-col justify-between gap-6">
                  {featuredGuides.slice(1, 3).map((guide) => (
                    <Link
                      key={guide.slug}
                      prefetch={false}
                      href={getGuidePath(guide)}
                      className="group border-t border-[var(--line)] pt-6 first:border-t-0 first:pt-0 lg:first:border-t lg:first:pt-6"
                    >
                      <p className="text-sm font-semibold text-[var(--accent-strong)]">
                        {guide.category}
                      </p>
                      <h3 className="mt-3 font-heading text-2xl font-semibold leading-tight text-[var(--ink)] group-hover:text-[var(--accent-strong)]">
                        {guide.title}
                      </h3>
                      <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
                        {guide.excerpt}
                      </p>
                    </Link>
                  ))}
                  <Link prefetch={false} href={`/${locale}/guides`} className="button-secondary self-start">
                    {locale === "zh" ? "查看全部指南" : "View all guides"}
                  </Link>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        <section id="faq" className="bg-[var(--page)] py-24 sm:py-32 lg:py-40">
          <div className="section-shell grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="max-w-xl">
              <h2 className="section-title">{content.faq.title}</h2>
              <p className="section-copy mt-6">{content.faq.description}</p>
            </div>
            <div>
              {content.faq.items.map((item, index) => (
                <details
                  key={item.question}
                  className="group border-b border-[var(--line)] py-5"
                  open={index === 0}
                >
                  <summary className="flex min-h-11 cursor-pointer items-start justify-between gap-5">
                    <span className="font-heading text-xl font-semibold text-[var(--ink)]">
                      {item.question}
                    </span>
                    <span
                      aria-hidden="true"
                      className="text-2xl text-[var(--accent-strong)] transition-transform group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--muted)]">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="bg-[var(--surface-muted)] py-24 sm:py-32 lg:py-40">
          <div className="section-shell grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div className="max-w-xl lg:sticky lg:top-28">
              <p className="section-eyebrow">{content.contact.eyebrow}</p>
              <h2 className="section-title mt-6">{content.contact.title}</h2>
              <p className="section-copy mt-6">{content.contact.description}</p>
              <div className="mt-9 space-y-1 border-t border-[var(--line)]">
                {content.contact.cards.map((card) => (
                  <div
                    key={card.title}
                    className="grid gap-1 border-b border-[var(--line)] py-4 sm:grid-cols-[8rem_1fr]"
                  >
                    <span className="text-sm text-[var(--muted)]">{card.title}</span>
                    {card.href ? (
                      <a
                        href={card.href}
                        className="break-all font-semibold text-[var(--ink)] underline decoration-[var(--accent)] underline-offset-4"
                      >
                        {card.body}
                      </a>
                    ) : (
                      <span className="font-semibold text-[var(--ink)]">
                        {card.body}
                      </span>
                    )}
                  </div>
                ))}
              </div>
              <Link
                href={getLocalizedPath(locale, "/privacy")}
                className="mt-6 inline-flex min-h-11 items-center text-sm font-semibold text-[var(--accent-strong)] underline underline-offset-4"
              >
                {content.nav.privacy}
              </Link>
            </div>
            <ContactForm
              locale={locale}
              content={content.contact.form}
              sourcePage={homePath}
            />
          </div>
        </section>
      </main>

      <SiteFooter locale={locale} footer={content.footer} />
      <FloatingCallButton locale={locale} />
      <HomeMotionLoader />
    </>
  );
}
