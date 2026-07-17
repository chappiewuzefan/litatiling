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
    <article className="group rounded-[2rem] border border-slate-200 bg-white p-7 shadow-[0_24px_70px_rgba(15,23,42,0.05)] transition hover:-translate-y-1 hover:shadow-[0_30px_90px_rgba(15,23,42,0.10)]">
      <div className="flex items-start justify-between gap-4">
        <Heading className="font-heading text-2xl font-semibold leading-tight text-slate-950">
          {service.name}
        </Heading>
        <span className="mt-1 h-3 w-3 shrink-0 rounded-full bg-orange-500" />
      </div>
      <p className="mt-4 line-clamp-3 text-sm leading-7 text-slate-600">
        {service.intro}
      </p>
      <Link
        href={getLocalizedPath(service.locale, `/services/${service.slug}`)}
        className="mt-6 inline-flex min-h-11 items-center rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-600"
      >
        {label} →
      </Link>
    </article>
  );
}
