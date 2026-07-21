import Image from "next/image";

import type { GalleryImage } from "@/lib/gallery";
import type { Locale } from "@/lib/site-config";

type ProcessStep = { title: string; description: string };

export function ProcessStack({
  locale,
  steps,
  image,
  title,
  description,
}: {
  locale: Locale;
  steps: ProcessStep[];
  image: GalleryImage;
  title: string;
  description: string;
}) {
  return (
    <div
      data-process-stack
      className="relative min-h-[100dvh] overflow-hidden bg-[var(--surface-muted)] py-24 lg:flex lg:items-center lg:py-20"
    >
      <div className="section-shell grid w-full gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
        <div className="max-w-xl">
          <h2 className="section-title">{title}</h2>
          <p className="section-copy mt-6">{description}</p>
          <div className="relative mt-8 hidden aspect-[4/3] overflow-hidden rounded-2xl lg:block">
            <Image
              src={image.src}
              alt={image.alt[locale]}
              fill
              sizes="36vw"
              className="object-cover"
            />
          </div>
        </div>

        <div className="relative grid gap-4 lg:h-[34rem] lg:overflow-hidden">
          {steps.map((step, index) => (
            <article
              key={step.title}
              data-process-card
              className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-7 shadow-[var(--shadow-soft)] lg:absolute lg:inset-x-0 lg:top-0 lg:min-h-[20rem] lg:p-10"
              style={{ zIndex: index + 1 }}
            >
              <p className="text-sm font-semibold text-[var(--accent-strong)]">
                {locale === "zh" ? `步骤 ${index + 1}` : `Step ${index + 1}`}
              </p>
              <h3 className="mt-4 font-heading text-3xl font-semibold tracking-[-0.025em] text-[var(--ink)] sm:text-4xl">
                {step.title}
              </h3>
              <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--muted)]">
                {step.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
