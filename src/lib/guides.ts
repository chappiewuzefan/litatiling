import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";
import { marked } from "marked";

import { getLocalizedPath, type Locale, locales } from "@/lib/site-config";

export type GuideStatus = "draft" | "published";

export type GuideSource = {
  title: string;
  url: string;
  publisher: string;
};

export type GuideFrontmatter = {
  locale: Locale;
  slug: string;
  translationKey: string;
  title: string;
  description: string;
  excerpt: string;
  category: string;
  heroImage: string;
  heroAlt: string;
  publishedAt: string;
  updatedAt: string;
  status: GuideStatus;
  featured: boolean;
  sources: GuideSource[];
};

export type Guide = GuideFrontmatter & {
  body: string;
  readingMinutes: number;
};

const guidesRoot = path.join(process.cwd(), "src", "content", "guides");
const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function assertString(
  value: unknown,
  field: string,
  filename: string,
): asserts value is string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${filename}: ${field} must be a non-empty string.`);
  }
}

function parseSource(
  value: unknown,
  filename: string,
  index: number,
): GuideSource {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${filename}: sources[${index}] must be an object.`);
  }

  const source = value as Record<string, unknown>;
  assertString(source.title, `sources[${index}].title`, filename);
  assertString(source.url, `sources[${index}].url`, filename);
  assertString(source.publisher, `sources[${index}].publisher`, filename);

  const url = new URL(source.url);
  if (url.protocol !== "https:") {
    throw new Error(`${filename}: sources[${index}].url must use HTTPS.`);
  }

  return {
    title: source.title,
    url: source.url,
    publisher: source.publisher,
  };
}

function parseFrontmatter(
  data: Record<string, unknown>,
  filename: string,
): GuideFrontmatter {
  const stringFields = [
    "locale",
    "slug",
    "translationKey",
    "title",
    "description",
    "excerpt",
    "category",
    "heroImage",
    "heroAlt",
    "publishedAt",
    "updatedAt",
    "status",
  ] as const;

  for (const field of stringFields) {
    assertString(data[field], field, filename);
  }

  const fields = data as Record<(typeof stringFields)[number], string>;

  if (!locales.includes(fields.locale as Locale)) {
    throw new Error(
      `${filename}: locale must be one of ${locales.join(", ")}.`,
    );
  }
  if (!slugPattern.test(fields.slug)) {
    throw new Error(`${filename}: slug must use lowercase kebab-case.`);
  }
  if (!slugPattern.test(fields.translationKey)) {
    throw new Error(
      `${filename}: translationKey must use lowercase kebab-case.`,
    );
  }
  if (
    !isoDatePattern.test(fields.publishedAt) ||
    !isoDatePattern.test(fields.updatedAt)
  ) {
    throw new Error(
      `${filename}: publishedAt and updatedAt must use YYYY-MM-DD.`,
    );
  }
  if (fields.updatedAt < fields.publishedAt) {
    throw new Error(
      `${filename}: updatedAt cannot be earlier than publishedAt.`,
    );
  }
  if (fields.status !== "draft" && fields.status !== "published") {
    throw new Error(`${filename}: status must be draft or published.`);
  }
  if (typeof data.featured !== "boolean") {
    throw new Error(`${filename}: featured must be a boolean.`);
  }
  if (!fields.heroImage.startsWith("/")) {
    throw new Error(`${filename}: heroImage must be an absolute site path.`);
  }

  const heroPath = path.join(
    process.cwd(),
    "public",
    fields.heroImage.slice(1),
  );
  if (!fs.existsSync(heroPath)) {
    throw new Error(
      `${filename}: heroImage does not exist at ${fields.heroImage}.`,
    );
  }
  if (!Array.isArray(data.sources) || data.sources.length === 0) {
    throw new Error(`${filename}: sources must contain at least one source.`);
  }

  return {
    locale: fields.locale as Locale,
    slug: fields.slug,
    translationKey: fields.translationKey,
    title: fields.title,
    description: fields.description,
    excerpt: fields.excerpt,
    category: fields.category,
    heroImage: fields.heroImage,
    heroAlt: fields.heroAlt,
    publishedAt: fields.publishedAt,
    updatedAt: fields.updatedAt,
    status: fields.status as GuideStatus,
    featured: data.featured,
    sources: data.sources.map((source, index) =>
      parseSource(source, filename, index),
    ),
  };
}

function estimateReadingMinutes(body: string, locale: Locale) {
  const units =
    locale === "zh"
      ? body.replace(/[\s\p{P}\p{S}]/gu, "").length
      : body.trim().split(/\s+/).filter(Boolean).length;
  const pace = locale === "zh" ? 500 : 220;
  return Math.max(1, Math.ceil(units / pace));
}

function loadGuideFile(filename: string): Guide {
  const source = fs.readFileSync(filename, "utf8");
  const parsed = matter(source);
  const frontmatter = parseFrontmatter(
    parsed.data as Record<string, unknown>,
    path.relative(process.cwd(), filename),
  );
  const filenameSlug = path.basename(filename, ".md");
  const directoryLocale = path.basename(path.dirname(filename));
  if (filenameSlug !== frontmatter.slug) {
    throw new Error(`${filename}: filename must match the frontmatter slug.`);
  }
  if (directoryLocale !== frontmatter.locale) {
    throw new Error(
      `${filename}: directory must match the frontmatter locale.`,
    );
  }

  if (parsed.content.trim().length < 600) {
    throw new Error(`${filename}: guide body is too short to publish.`);
  }

  return {
    ...frontmatter,
    body: parsed.content.trim(),
    readingMinutes: estimateReadingMinutes(parsed.content, frontmatter.locale),
  };
}

function guideFiles() {
  if (!fs.existsSync(guidesRoot)) {
    return [];
  }

  return locales.flatMap((locale) => {
    const directory = path.join(guidesRoot, locale);
    if (!fs.existsSync(directory)) {
      return [];
    }

    return fs
      .readdirSync(directory)
      .filter((filename) => filename.endsWith(".md"))
      .map((filename) => path.join(directory, filename));
  });
}

export function getAllGuides(options: { includeDrafts?: boolean } = {}) {
  const guides = guideFiles().map(loadGuideFile);
  const filtered = options.includeDrafts
    ? guides
    : guides.filter((guide) => guide.status === "published");

  return filtered.sort((a, b) => {
    const dateOrder = b.publishedAt.localeCompare(a.publishedAt);
    return dateOrder || a.title.localeCompare(b.title);
  });
}

export function getGuides(locale: Locale) {
  return getAllGuides().filter((guide) => guide.locale === locale);
}

export function getGuide(locale: Locale, slug: string) {
  return getGuides(locale).find((guide) => guide.slug === slug);
}

export function getFeaturedGuides(locale: Locale, limit = 3) {
  return getGuides(locale)
    .filter((guide) => guide.featured)
    .slice(0, limit);
}

export function getRelatedGuides(guide: Guide, limit = 3) {
  return getGuides(guide.locale)
    .filter((candidate) => candidate.translationKey !== guide.translationKey)
    .sort((a, b) => {
      const categoryMatchA = a.category === guide.category ? 1 : 0;
      const categoryMatchB = b.category === guide.category ? 1 : 0;
      return categoryMatchB - categoryMatchA;
    })
    .slice(0, limit);
}

export function getGuidePath(guide: Pick<Guide, "locale" | "slug">) {
  return getLocalizedPath(guide.locale, `/guides/${guide.slug}`);
}

export function renderGuideMarkdown(body: string) {
  const html = marked.parse(body, { async: false, gfm: true });
  if (typeof html !== "string") {
    throw new Error("Guide markdown unexpectedly rendered asynchronously.");
  }
  let sectionIndex = 0;
  return html.replace(/<h2>(.*?)<\/h2>/g, (_heading, content: string) => {
    sectionIndex += 1;
    return `<h2 id="section-${sectionIndex}">${content}</h2>`;
  });
}

export function getGuideSections(body: string) {
  return [...body.matchAll(/^##\s+(.+)$/gm)].map((match, index) => ({
    id: `section-${index + 1}`,
    title: match[1].replace(/[*_`]/g, "").trim(),
  }));
}

export function validateGuideLibrary() {
  const guides = getAllGuides({ includeDrafts: true });
  const routeKeys = new Set<string>();
  const translations = new Map<string, Set<Locale>>();

  for (const guide of guides) {
    const routeKey = `${guide.locale}:${guide.slug}`;
    if (routeKeys.has(routeKey)) {
      throw new Error(`Duplicate guide route: ${routeKey}.`);
    }
    routeKeys.add(routeKey);

    const pair = translations.get(guide.translationKey) ?? new Set<Locale>();
    pair.add(guide.locale);
    translations.set(guide.translationKey, pair);
  }

  for (const [translationKey, pair] of translations) {
    for (const locale of locales) {
      if (!pair.has(locale)) {
        throw new Error(
          `${translationKey} is missing the ${locale} translation.`,
        );
      }
    }
  }

  return guides;
}
