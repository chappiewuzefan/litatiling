import Image from "next/image";
import Link from "next/link";

import { getLocalizedPath } from "@/lib/site-config";
import type { ServicePage } from "@/lib/service-pages";

export function ServiceCard({
  service,
  label,
  headingLevel = "h2",
}: {
  service: ServicePage;
  label: string;
  headingLevel?: "h2" | "h3";
}) {
  const Heading = headingLevel;
  return (
    <article className="group overflow-hidden rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow-soft)] transition duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-image)]">
      <Link
        href={getLocalizedPath(service.locale, `/services/${service.slug}`)}
        className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-[var(--surface-muted)]">
          <Image
            src={service.heroImage}
            alt={service.description}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        </div>
        <div className="p-7">
          <div className="flex items-start justify-between gap-4">
            <Heading className="font-heading text-2xl font-semibold leading-tight text-[var(--ink)]">
              {service.name}
            </Heading>
            <span className="mt-1 h-3 w-3 shrink-0 rounded-full bg-[var(--accent)]" />
          </div>
          <p className="mt-4 line-clamp-3 text-sm leading-7 text-[var(--muted)]">
            {service.intro}
          </p>
          <span className="mt-6 inline-flex min-h-11 items-center font-semibold text-[var(--accent-strong)] underline decoration-[var(--accent)] decoration-2 underline-offset-8">
            {label} →
          </span>
        </div>
      </Link>
    </article>
  );
}
