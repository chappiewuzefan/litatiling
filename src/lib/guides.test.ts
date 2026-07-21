import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import sitemap from "@/app/sitemap";
import { generateMetadata as generateThanksMetadata } from "@/app/[locale]/thanks/page";
import { metadata as quoteMetadata } from "@/app/quote/page";
import { buildMetadata } from "@/lib/metadata";
import {
  getAllGuides,
  getGuide,
  getGuides,
  renderGuideMarkdown,
  validateGuideLibrary,
} from "@/lib/guides";
import {
  absoluteUrl,
  contentLastModified,
  getLanguageAlternates,
  locales,
} from "@/lib/site-config";
import { getServicePages, serviceSlugs } from "@/lib/service-pages";
import {
  buildGuideStructuredData,
  buildServiceStructuredData,
} from "@/lib/structured-data";

describe("guide library", () => {
  it("contains eight published, paired guides per locale", () => {
    const guides = validateGuideLibrary();

    expect(guides).toHaveLength(16);
    for (const locale of locales) {
      expect(getGuides(locale)).toHaveLength(8);
    }

    for (const guide of guides) {
      const translation = getGuide(
        guide.locale === "en" ? "zh" : "en",
        guide.slug,
      );
      expect(translation?.translationKey).toBe(guide.translationKey);
      expect(guide.sources.length).toBeGreaterThan(0);
      expect(
        fs.existsSync(
          path.join(process.cwd(), "public", guide.heroImage.slice(1)),
        ),
      ).toBe(true);
      expect(renderGuideMarkdown(guide.body)).toContain("<h2>");
    }
  });

  it("uses locale-correct internal links", () => {
    for (const guide of getAllGuides()) {
      const links = [...guide.body.matchAll(/\]\((\/(?:en|zh)\/[^)]+)\)/g)].map(
        (match) => match[1],
      );
      expect(links.length).toBeGreaterThan(0);
      for (const link of links) {
        expect(link.startsWith(`/${guide.locale}/`)).toBe(true);
      }
    }
  });
});

describe("service pages and SEO output", () => {
  it("defines seven unique service pages in both languages", () => {
    for (const locale of locales) {
      const services = getServicePages(locale);
      expect(services).toHaveLength(7);
      expect(new Set(services.map((service) => service.slug)).size).toBe(7);
      expect(services.map((service) => service.slug)).toEqual([
        ...serviceSlugs,
      ]);
      for (const service of services) {
        expect(service.faq.length).toBeGreaterThanOrEqual(3);
        expect(service.process).toHaveLength(4);
        expect(
          service.relatedGuideKeys.every((key) =>
            getAllGuides().some((guide) => guide.translationKey === key),
          ),
        ).toBe(true);
      }
    }
  });

  it("builds truthful Article and Service graph types", () => {
    const guide = getGuides("en")[0];
    const articleGraph = buildGuideStructuredData(guide)["@graph"] as Array<
      Record<string, unknown>
    >;
    expect(articleGraph.some((node) => node["@type"] === "Article")).toBe(true);
    expect(
      articleGraph.some(
        (node) => node["@type"] === "HomeAndConstructionBusiness",
      ),
    ).toBe(true);

    const serviceGraph = buildServiceStructuredData(getServicePages("en")[0])[
      "@graph"
    ] as Array<Record<string, unknown>>;
    expect(serviceGraph.some((node) => node["@type"] === "Service")).toBe(true);
    expect(
      serviceGraph.some((node) => node["@type"] === "BreadcrumbList"),
    ).toBe(true);
  });

  it("emits only the forty intended canonical sitemap URLs", () => {
    const entries = sitemap();
    const urls = entries.map((entry) => entry.url);

    expect(entries).toHaveLength(40);
    expect(new Set(urls).size).toBe(40);
    expect(
      urls.some((url) => {
        const pathname = new URL(url).pathname;
        return (
          /\/(?:thanks|privacy)(?:\/|$)/.test(pathname) ||
          pathname.startsWith("/quote")
        );
      }),
    ).toBe(false);
    const guideLastModifiedByUrl = new Map(
      getAllGuides().map((guide) => [
        absoluteUrl(`/${guide.locale}/guides/${guide.slug}`),
        guide.updatedAt,
      ]),
    );
    expect(
      entries.every((entry) => {
        const guideLastModified = guideLastModifiedByUrl.get(entry.url);
        return (
          entry.lastModified === (guideLastModified ?? contentLastModified)
        );
      }),
    ).toBe(true);
    expect(
      entries.every((entry) => entry.alternates?.languages?.["en-AU"]),
    ).toBe(true);
    expect(
      entries.every((entry) => entry.alternates?.languages?.["zh-Hans-AU"]),
    ).toBe(true);
  });

  it("uses the canonical domain and Australian language alternates", () => {
    const metadata = buildMetadata({
      locale: "en",
      path: "/guides",
      title: "Guides",
      description: "Guide description",
    });

    expect(metadata.alternates?.canonical).toBe(absoluteUrl("/en/guides"));
    expect(metadata.alternates?.languages).toEqual(
      getLanguageAlternates("/guides"),
    );
    expect(metadata).not.toHaveProperty("keywords");
  });

  it("keeps conversion and questionnaire routes out of the index", async () => {
    const thanksMetadata = await generateThanksMetadata({
      params: Promise.resolve({ locale: "en" }),
    });

    expect(thanksMetadata.robots).toEqual({ index: false, follow: true });
    expect(quoteMetadata.robots).toEqual({ index: false, follow: false });
  });
});
