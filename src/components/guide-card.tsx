import Image from "next/image";
import Link from "next/link";

import { getGuidePath, type Guide } from "@/lib/guides";

function formatDate(date: string, locale: Guide["locale"]) {
  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Australia/Sydney",
  }).format(new Date(`${date}T00:00:00+10:00`));
}

export function GuideCard({
  guide,
  headingLevel = "h2",
}: {
  guide: Guide;
  headingLevel?: "h2" | "h3";
}) {
  const readLabel = guide.locale === "zh" ? "阅读指南" : "Read guide";
  const minuteLabel = guide.locale === "zh" ? "分钟阅读" : "min read";
  const Heading = headingLevel;

  return (
    <article className="group overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.05)] transition hover:-translate-y-1 hover:shadow-[0_30px_90px_rgba(15,23,42,0.10)]">
      <Link
        href={getGuidePath(guide)}
        className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-600"
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
          <Image
            src={guide.heroImage}
            alt={guide.heroAlt}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        </div>
        <div className="p-6 sm:p-7">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold uppercase tracking-[0.12em] text-sky-700">
            <span>{guide.category}</span>
            <span aria-hidden="true" className="text-slate-300">
              •
            </span>
            <span className="normal-case tracking-normal text-slate-500">
              {guide.readingMinutes} {minuteLabel}
            </span>
          </div>
          <Heading className="mt-4 font-heading text-2xl font-semibold leading-tight text-slate-950">
            {guide.title}
          </Heading>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            {guide.excerpt}
          </p>
          <div className="mt-6 flex items-center justify-between gap-4 text-sm">
            <time dateTime={guide.updatedAt} className="text-slate-500">
              {formatDate(guide.updatedAt, guide.locale)}
            </time>
            <span className="font-semibold text-orange-700">{readLabel} →</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
