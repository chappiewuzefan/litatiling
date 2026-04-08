"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

import type { GalleryImage } from "@/lib/gallery";
import type { Locale } from "@/lib/site-config";

type ProjectItem = {
  suburb: string;
  title: string;
  summary: string;
  result: string;
  highlights: string[];
};

type ProjectCarouselProps = {
  locale: Locale;
  items: ProjectItem[];
  images: GalleryImage[];
};

function getCardsPerView() {
  if (typeof window === "undefined") {
    return 1;
  }

  return window.matchMedia("(min-width: 1024px)").matches ? 2 : 1;
}

function prefersReducedMotion() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function ProjectCarousel({
  locale,
  items,
  images,
}: ProjectCarouselProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<Array<HTMLElement | null>>([]);
  const [cardsPerView, setCardsPerView] = useState(1);
  const [activePage, setActivePage] = useState(0);

  useEffect(() => {
    function syncCardsPerView() {
      setCardsPerView(getCardsPerView());
    }

    syncCardsPerView();
    window.addEventListener("resize", syncCardsPerView);

    return () => {
      window.removeEventListener("resize", syncCardsPerView);
    };
  }, []);

  const pageStartIndexes = useMemo(() => {
    const indexes: number[] = [];
    for (let index = 0; index < items.length; index += cardsPerView) {
      indexes.push(index);
    }

    return indexes;
  }, [cardsPerView, items.length]);

  function syncActivePage() {
    const track = trackRef.current;

    if (!track) {
      return;
    }

    const offsets = pageStartIndexes.map(
      (index) => cardRefs.current[index]?.offsetLeft ?? 0,
    );
    const currentLeft = track.scrollLeft;
    let nearestIndex = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;

    offsets.forEach((offset, index) => {
      const distance = Math.abs(offset - currentLeft);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });

    setActivePage(nearestIndex);
  }

  useEffect(() => {
    const track = trackRef.current;

    if (!track) {
      return;
    }

    const offsets = pageStartIndexes.map(
      (index) => cardRefs.current[index]?.offsetLeft ?? 0,
    );
    const currentLeft = track.scrollLeft;
    let nearestIndex = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;

    offsets.forEach((offset, index) => {
      const distance = Math.abs(offset - currentLeft);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });

    setActivePage(nearestIndex);
  }, [cardsPerView, items.length, pageStartIndexes]);

  function scrollToPage(pageIndex: number) {
    const track = trackRef.current;
    const targetIndex = pageStartIndexes[pageIndex];
    const targetCard = cardRefs.current[targetIndex];

    if (!track || !targetCard) {
      return;
    }

    track.scrollTo({
      left: targetCard.offsetLeft,
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
    setActivePage(pageIndex);
  }

  const prevLabel = locale === "zh" ? "上一组案例" : "Previous case studies";
  const nextLabel = locale === "zh" ? "下一组案例" : "Next case studies";
  const hintText =
    locale === "zh"
      ? "左右滑动或点箭头查看更多案例"
      : "Swipe or use the arrows to see more case studies";

  return (
    <div className="mt-10 space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">{hintText}</p>
        {pageStartIndexes.length > 1 ? (
          <div className="flex items-center gap-3 self-start sm:self-auto">
            <button
              type="button"
              aria-label={prevLabel}
              onClick={() => scrollToPage(Math.max(activePage - 1, 0))}
              disabled={activePage === 0}
              className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-sky-300 hover:text-sky-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path d="M15 6 9 12l6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              aria-label={nextLabel}
              onClick={() =>
                scrollToPage(Math.min(activePage + 1, pageStartIndexes.length - 1))
              }
              disabled={activePage === pageStartIndexes.length - 1}
              className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-sky-300 hover:text-sky-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path d="m9 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        ) : null}
      </div>

      <div className="-mx-4 overflow-hidden px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div
          ref={trackRef}
          onScroll={syncActivePage}
          className="no-scrollbar flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4"
        >
          {items.map((project, index) => (
            <article
              key={`${project.suburb}-${project.title}`}
              ref={(element) => {
                cardRefs.current[index] = element;
              }}
              className="basis-full shrink-0 snap-start overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_26px_80px_rgba(15,23,42,0.05)] lg:basis-[calc(50%-0.75rem)]"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-slate-950">
                <Image
                  src={images[index].src}
                  alt={images[index].alt[locale]}
                  fill
                  sizes="(min-width: 1024px) 48vw, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-300">
                    {project.suburb}
                  </p>
                  <h3 className="mt-2 font-heading text-2xl font-semibold">
                    {project.title}
                  </h3>
                </div>
              </div>
              <div className="space-y-5 p-7">
                <p className="text-sm leading-7 text-slate-600">{project.summary}</p>
                <div className="rounded-[1.5rem] bg-slate-50 p-5 text-sm leading-7 text-slate-700">
                  {project.result}
                </div>
                <ul className="space-y-3 text-sm text-slate-700">
                  {project.highlights.map((highlight) => (
                    <li key={highlight} className="flex items-start gap-3">
                      <span className="mt-2 h-2 w-2 rounded-full bg-orange-500" />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </div>

      {pageStartIndexes.length > 1 ? (
        <div className="flex items-center justify-center gap-2">
          {pageStartIndexes.map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={
                locale === "zh" ? `跳到第 ${index + 1} 组案例` : `Go to slide ${index + 1}`
              }
              onClick={() => scrollToPage(index)}
              className={`h-2.5 rounded-full transition ${
                index === activePage
                  ? "w-8 bg-sky-600"
                  : "w-2.5 bg-slate-300 hover:bg-slate-400"
              }`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
