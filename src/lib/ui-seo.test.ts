import fs from "node:fs";
import path from "node:path";

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import robots from "@/app/robots";
import { FloatingCallButton } from "@/components/floating-call-button";
import { getContent } from "@/lib/content";
import {
  getAllGuides,
  getGuide,
  getGuideSections,
  renderGuideMarkdown,
} from "@/lib/guides";
import { getServicePages } from "@/lib/service-pages";
import {
  buildStructuredData,
  formatAustralianPhoneForSchema,
} from "@/lib/structured-data";

function sourceFiles(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(filename);
    return /\.(?:ts|tsx|md|css)$/.test(entry.name) ? [filename] : [];
  });
}

describe("UI and SEO evolution", () => {
  it("uses the approved bilingual homepage metadata", () => {
    expect(getContent("en").metadata).toEqual({
      title: "Canberra Tiler & Waterproofing | LITA Tiling",
      description:
        "Licensed Canberra tiling and waterproofing for bathrooms, floors, walls, splashbacks, pools and repairs. Free quotes in English or Chinese.",
    });
    expect(getContent("zh").metadata).toEqual({
      title: "堪培拉贴砖与防水 | LITA Tiling Canberra",
      description:
        "LITA 提供堪培拉住宅贴砖、防水、浴室、地面、墙面、挡水板、泳池砖与维修服务，支持中英文沟通和免费报价。",
    });
  });

  it("keeps guide and service metadata titles unique", () => {
    const titles = [
      ...getAllGuides().map((guide) => `${guide.locale}:${guide.title}`),
      ...(["en", "zh"] as const).flatMap((locale) =>
        getServicePages(locale).map(
          (service) => `${locale}:${service.metadataTitle}`,
        ),
      ),
    ];
    expect(new Set(titles).size).toBe(titles.length);
    expect(
      getAllGuides()
        .filter((guide) => guide.locale === "en")
        .every((guide) => guide.description.length <= 160),
    ).toBe(true);
  });

  it("uses concise approved titles for the five English guides", () => {
    expect(getGuide("en", "bathroom-floor-tiles")?.title).toBe(
      "Bathroom Floor Tiles: Slip Resistance, Falls & Drainage",
    );
    expect(getGuide("en", "bathroom-waterproofing-canberra")?.title).toBe(
      "Bathroom Waterproofing Canberra: What to Know Before Tiling",
    );
    expect(getGuide("en", "large-format-tiles")?.title).toBe(
      "Large-Format Tiles: Substrates, Lippage & Movement Joints",
    );
    expect(getGuide("en", "outdoor-pool-tiling-canberra")?.title).toBe(
      "Outdoor & Pool Tiling Canberra: Climate, Drainage & Tiles",
    );
    expect(getGuide("en", "regrout-reseal-or-retile")?.title).toBe(
      "Regrout, Reseal or Re-Tile Canberra Showers",
    );
  });

  it("adds stable guide section anchors for the table of contents", () => {
    const guide = getGuide("en", "bathroom-waterproofing-canberra");
    expect(guide).toBeDefined();
    const sections = getGuideSections(guide!.body);
    const html = renderGuideMarkdown(guide!.body);

    expect(sections.length).toBeGreaterThan(3);
    for (const section of sections) {
      expect(html).toContain(`id="${section.id}"`);
    }
  });

  it("emits international schema phones and two contact points", () => {
    expect(formatAustralianPhoneForSchema("0435 248 809")).toBe(
      "+61435248809",
    );
    expect(formatAustralianPhoneForSchema("0478 516 702")).toBe(
      "+61478516702",
    );

    const graph = buildStructuredData("en")["@graph"] as Array<
      Record<string, unknown>
    >;
    const business = graph.find(
      (node) => node["@type"] === "HomeAndConstructionBusiness",
    );
    const contacts = business?.contactPoint as Array<Record<string, unknown>>;

    expect(business?.telephone).toBe("+61435248809");
    expect(contacts.map((contact) => contact.telephone)).toEqual([
      "+61435248809",
      "+61478516702",
    ]);
  });

  it("keeps the visible phone labels inside each accessible name", () => {
    const markup = renderToStaticMarkup(
      createElement(FloatingCallButton, { locale: "en" }),
    );

    expect(markup).toContain('aria-label="Primary · 0435 248 809"');
    expect(markup).toContain(">Primary · 0435 248 809</a>");
    expect(markup).toContain('aria-label="Backup · 0478 516 702"');
    expect(markup).toContain(">Backup · 0478 516 702</a>");
  });

  it("keeps public content free of visible long dash characters", () => {
    const longDash = new RegExp("[\\u2013\\u2014]");
    const offenders = sourceFiles(path.join(process.cwd(), "src")).filter(
      (filename) => longDash.test(fs.readFileSync(filename, "utf8")),
    );

    expect(offenders).toEqual([]);
  });

  it("keeps OAI-SearchBot allowed", () => {
    const rules = robots().rules as Array<{
      userAgent: string | string[];
      allow?: string | string[];
    }>;
    expect(rules).toContainEqual({ userAgent: "OAI-SearchBot", allow: "/" });
  });
});
