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
import {
  getAllGuides,
  getGuide,
  getGuideSections,
  getRelatedGuides,
  renderGuideMarkdown,
} from "@/lib/guides";
import { buildMetadata } from "@/lib/metadata";
import { absoluteUrl, getLocalizedPath, isLocale } from "@/lib/site-config";
import { servicePageUi } from "@/lib/service-pages";
import { buildGuideStructuredData } from "@/lib/structured-data";

type PageProps = { params: Promise<{ locale: string; slug: string }> };
export function generateStaticParams() {
  return getAllGuides().map((guide) => ({
    locale: guide.locale,
    slug: guide.slug,
  }));
}
async function resolvePage(params: PageProps["params"]) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const guide = getGuide(locale, slug);
  if (!guide) notFound();
  return { locale, guide };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale, guide } = await resolvePage(params);
  const metadata = buildMetadata({
    locale,
    path: `/guides/${guide.slug}`,
    title: guide.title,
    description: guide.description,
    image: guide.heroImage,
  });
  return {
    ...metadata,
    openGraph: {
      ...metadata.openGraph,
      type: "article",
      publishedTime: guide.publishedAt,
      modifiedTime: guide.updatedAt,
      images: [{ url: absoluteUrl(guide.heroImage), alt: guide.heroAlt }],
    },
  };
}

function formatDate(date: string, locale: "en" | "zh") {
  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Australia/Sydney",
  }).format(new Date(`${date}T00:00:00+10:00`));
}

export default async function GuideDetailPage({ params }: PageProps) {
  const { locale, guide } = await resolvePage(params);
  const content = getContent(locale);
  const related = getRelatedGuides(guide);
  const ui = servicePageUi[locale];
  const html = renderGuideMarkdown(guide.body);
  const sections = getGuideSections(guide.body);
  const structuredData = buildGuideStructuredData(guide);
  const labels =
    locale === "zh"
      ? {
          home: "首页",
          guides: "指南",
          updated: "最近更新",
          read: "分钟阅读",
          sources: "资料来源与进一步阅读",
          summary: "先看结论",
          contents: "本文内容",
          note: "本文提供一般性项目信息，实际做法应根据现场状态、适用要求和所选产品系统确认。",
          related: "继续阅读",
        }
      : {
          home: "Home",
          guides: "Guides",
          updated: "Updated",
          read: "min read",
          sources: "Sources and further reading",
          summary: "At a glance",
          contents: "On this page",
          note: "This guide provides general project information. The actual approach must be confirmed against site conditions, applicable requirements and the selected product system.",
          related: "Continue reading",
        };
  return (
    <>
      <JsonLd data={structuredData} />
      <SiteHeader
        locale={locale}
        labels={content.nav}
        currentPath={`/guides/${guide.slug}`}
      />
      <main id="main-content">
        <article>
          <header className="bg-white py-12 sm:py-16">
            <div className="section-shell">
              <Breadcrumbs
                items={[
                  { label: labels.home, href: getLocalizedPath(locale) },
                  {
                    label: labels.guides,
                    href: getLocalizedPath(locale, "/guides"),
                  },
                  { label: guide.title },
                ]}
              />
              <div className="mt-10 max-w-5xl">
                <p className="section-eyebrow">{guide.category}</p>
                <h1 className="mt-5 font-heading text-4xl font-semibold leading-tight tracking-[-0.035em] text-slate-950 sm:text-6xl">
                  {guide.title}
                </h1>
                <p className="mt-6 max-w-4xl text-lg leading-8 text-slate-600">
                  {guide.excerpt}
                </p>
                <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500">
                  <span>
                    {labels.updated}{" "}
                    <time dateTime={guide.updatedAt}>
                      {formatDate(guide.updatedAt, locale)}
                    </time>
                  </span>
                  <span aria-hidden="true">•</span>
                  <span>
                    {guide.readingMinutes} {labels.read}
                  </span>
                  <span aria-hidden="true">•</span>
                  <span>LITA Tiling Canberra</span>
                </div>
              </div>
            </div>
          </header>
          <div className="section-shell">
            <div className="relative aspect-[16/8] overflow-hidden rounded-[2rem] bg-slate-100 shadow-[0_28px_90px_rgba(15,23,42,0.12)]">
              <Image
                src={guide.heroImage}
                alt={guide.heroAlt}
                fill
                priority
                sizes="(max-width: 1280px) 100vw, 1280px"
                className="object-cover"
              />
            </div>
          </div>
          <div className="section-shell grid gap-10 py-14 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
            <div>
              <aside className="mb-10 rounded-2xl border border-[var(--line)] bg-[var(--surface-muted)] p-6 sm:p-7">
                <h2 className="font-heading text-2xl font-semibold text-[var(--ink)]">
                  {labels.summary}
                </h2>
                <p className="mt-4 text-base leading-8 text-[var(--muted)]">
                  {guide.excerpt}
                </p>
              </aside>
              <div
                className="guide-prose"
                dangerouslySetInnerHTML={{ __html: html }}
              />
              <aside className="mt-10 rounded-[1.5rem] border border-sky-200 bg-sky-50 p-5 text-sm leading-7 text-sky-950">
                {labels.note}
              </aside>
              <section className="mt-12 border-t border-slate-200 pt-8">
                <h2 className="font-heading text-2xl font-semibold text-slate-950">
                  {labels.sources}
                </h2>
                <ol className="mt-5 space-y-3 text-sm leading-7 text-slate-600">
                  {guide.sources.map((source) => (
                    <li key={source.url}>
                      <a
                        href={source.url}
                        rel="noreferrer"
                        className="font-semibold text-sky-800 underline decoration-sky-300 underline-offset-4 hover:text-sky-600"
                      >
                        {source.title}
                      </a>
                      <span className="text-slate-500">
                        {" "}
                        - {source.publisher}
                      </span>
                    </li>
                  ))}
                </ol>
              </section>
            </div>
            <div className="guide-sidebar space-y-6">
              <nav
                aria-label={labels.contents}
                className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6"
              >
                <p className="font-heading text-lg font-semibold text-[var(--ink)]">
                  {labels.contents}
                </p>
                <ol className="mt-4 space-y-3 text-sm leading-6 text-[var(--muted)]">
                  {sections.map((section) => (
                    <li key={section.id}>
                      <a
                        href={`#${section.id}`}
                        className="hover:text-[var(--accent-strong)]"
                      >
                        {section.title}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
              <QuoteCta
                locale={locale}
                title={ui.ctaTitle}
                description={ui.ctaDescription}
                primaryLabel={ui.requestQuote}
              />
            </div>
          </div>
        </article>
        <section className="bg-slate-100/80 py-16 sm:py-20">
          <div className="section-shell">
            <p className="section-eyebrow">{labels.related}</p>
            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {related.map((item) => (
                <GuideCard key={item.slug} guide={item} />
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter locale={locale} footer={content.footer} />
    </>
  );
}
