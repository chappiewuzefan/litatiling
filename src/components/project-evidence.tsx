import Image from "next/image";

import type { GalleryImage } from "@/lib/gallery";
import type { Locale } from "@/lib/site-config";

type ProjectItem = {
  suburb: string;
  title: string;
  summary: string;
  result: string;
  highlights: string[];
};

export function ProjectEvidence({
  locale,
  items,
  images,
}: {
  locale: Locale;
  items: ProjectItem[];
  images: GalleryImage[];
}) {
  const hint =
    locale === "zh"
      ? "横向滑动查看真实项目照片和施工细节"
      : "Scroll sideways for real project photos and finish details";

  return (
    <div className="mt-10">
      <p className="mb-5 text-sm text-[var(--muted)]">{hint}</p>
      <div className="no-scrollbar grid snap-x snap-mandatory auto-cols-[88%] grid-flow-col gap-5 overflow-x-auto pb-5 sm:auto-cols-[48%] xl:auto-cols-[32%]">
        {items.slice(0, 6).map((project, index) => {
          const image = images[index];

          return (
            <article
              key={`${project.suburb}-${project.title}`}
              className="group snap-start overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow-soft)]"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-[var(--ink)]">
                <Image
                  data-project-image
                  src={image.src}
                  alt={image.alt[locale]}
                  fill
                  sizes="(max-width: 640px) 88vw, (max-width: 1280px) 48vw, 32vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </div>
              <div className="p-6">
                <p className="text-sm font-semibold text-[var(--accent-strong)]">
                  {project.suburb}
                </p>
                <h3 className="mt-2 font-heading text-2xl font-semibold leading-tight text-[var(--ink)]">
                  {project.title}
                </h3>
                <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
                  {project.summary}
                </p>
                <p className="mt-5 border-l-2 border-[var(--accent)] pl-4 text-sm leading-7 text-[var(--ink-soft)]">
                  {project.result}
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
