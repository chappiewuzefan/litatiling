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

type ProjectPage = Array<{
  project: ProjectItem;
  image: GalleryImage;
  key: string;
}>;

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
  const pageRefs = useRef<Array<HTMLDivElement | null>>([]);
  const scrollTimeoutRef = useRef<number | null>(null);
  const [cardsPerView, setCardsPerView] = useState(1);
  const [activePage, setActivePage] = useState(0);
  const [activeLoopedPage, setActiveLoopedPage] = useState(0);

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

  const pages = useMemo<ProjectPage[]>(() => {
    const groupedPages: ProjectPage[] = [];

    for (let index = 0; index < items.length; index += cardsPerView) {
      const pageItems = items.slice(index, index + cardsPerView).map((project, offset) => {
        const cardIndex = index + offset;

        return {
          project,
          image: images[cardIndex],
          key: `${project.suburb}-${project.title}-${cardIndex}`,
        };
      });

      groupedPages.push(pageItems);
    }

    return groupedPages;
  }, [cardsPerView, images, items]);

  const pageCount = pages.length;
  const loopedPages = useMemo(() => {
    if (pageCount <= 1) {
      return pages;
    }

    return [...pages, ...pages, ...pages];
  }, [pageCount, pages]);

  const middleStartIndex = pageCount <= 1 ? 0 : pageCount;

  function getNearestLoopedPage() {
    const track = trackRef.current;

    if (!track) {
      return 0;
    }

    let nearestIndex = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;

    pageRefs.current.forEach((page, index) => {
      const offset = page?.offsetLeft ?? 0;
      const distance = Math.abs(offset - track.scrollLeft);

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });

    return nearestIndex;
  }

  function setActiveFromLoopedPage(loopedPageIndex: number) {
    setActiveLoopedPage(loopedPageIndex);
    setActivePage(pageCount === 0 ? 0 : loopedPageIndex % pageCount);
  }

  function jumpToLoopedPage(loopedPageIndex: number, smooth: boolean) {
    const track = trackRef.current;
    const targetPage = pageRefs.current[loopedPageIndex];

    if (!track || !targetPage) {
      return;
    }

    track.scrollTo({
      left: targetPage.offsetLeft,
      behavior: smooth && !prefersReducedMotion() ? "smooth" : "auto",
    });
    setActiveFromLoopedPage(loopedPageIndex);
  }

  function recenterIfNeeded() {
    if (pageCount <= 1) {
      return;
    }

    const nearestIndex = getNearestLoopedPage();
    const logicalPage = nearestIndex % pageCount;

    setActiveFromLoopedPage(nearestIndex);

    if (nearestIndex < pageCount || nearestIndex >= pageCount * 2) {
      jumpToLoopedPage(logicalPage + pageCount, false);
    }
  }

  function syncActivePage() {
    const nearestIndex = getNearestLoopedPage();
    setActiveFromLoopedPage(nearestIndex);

    if (scrollTimeoutRef.current) {
      window.clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = window.setTimeout(() => {
      recenterIfNeeded();
    }, 120);
  }

  useEffect(() => {
    if (pageCount === 0) {
      return;
    }

    const targetIndex = middleStartIndex;
    const frame = window.requestAnimationFrame(() => {
      const track = trackRef.current;
      const targetPage = pageRefs.current[targetIndex];

      if (!track || !targetPage) {
        return;
      }

      track.scrollTo({
        left: targetPage.offsetLeft,
        behavior: "auto",
      });
      setActiveLoopedPage(targetIndex);
      setActivePage(pageCount === 0 ? 0 : targetIndex % pageCount);
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [middleStartIndex, pageCount]);

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        window.clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  function scrollToLogicalPage(logicalPage: number) {
    if (pageCount <= 1) {
      return;
    }

    const candidates = [
      logicalPage,
      logicalPage + pageCount,
      logicalPage + pageCount * 2,
    ];

    let targetLoopedPage = candidates[0];
    let nearestDistance = Number.POSITIVE_INFINITY;

    candidates.forEach((candidate) => {
      const distance = Math.abs(candidate - activeLoopedPage);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        targetLoopedPage = candidate;
      }
    });

    jumpToLoopedPage(targetLoopedPage, true);
  }

  function handleStep(direction: -1 | 1) {
    if (pageCount <= 1) {
      return;
    }

    jumpToLoopedPage(activeLoopedPage + direction, true);
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
        {pageCount > 1 ? (
          <div className="flex items-center gap-3 self-start sm:self-auto">
            <button
              type="button"
              aria-label={prevLabel}
              onClick={() => handleStep(-1)}
              className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-sky-300 hover:text-sky-700"
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
              onClick={() => handleStep(1)}
              className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-sky-300 hover:text-sky-700"
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
          {loopedPages.map((page, pageIndex) => (
            <div
              key={`page-${pageIndex}`}
              ref={(element) => {
                pageRefs.current[pageIndex] = element;
              }}
              className="basis-full shrink-0 snap-start"
            >
              <div className="flex flex-col gap-6 lg:flex-row">
                {page.map(({ project, image, key }) => (
                  <article
                    key={key}
                    className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_26px_80px_rgba(15,23,42,0.05)] lg:w-[calc(50%-0.75rem)]"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-slate-950">
                      <Image
                        src={image.src}
                        alt={image.alt[locale]}
                        fill
                        sizes="(min-width: 1024px) 44vw, 100vw"
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
                      <p className="text-sm leading-7 text-slate-600">
                        {project.summary}
                      </p>
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
          ))}
        </div>
      </div>

      {pageCount > 1 ? (
        <div className="flex items-center justify-center gap-2">
          {pages.map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={
                locale === "zh" ? `跳到第 ${index + 1} 组案例` : `Go to slide ${index + 1}`
              }
              onClick={() => scrollToLogicalPage(index)}
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
