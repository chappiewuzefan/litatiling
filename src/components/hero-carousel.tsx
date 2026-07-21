"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";

import type { GalleryImage } from "@/lib/gallery";
import type { Locale } from "@/lib/site-config";

export type HeroCarouselSlide = {
  image: GalleryImage;
  title: string;
  location: string;
};

export function HeroCarousel({
  locale,
  slides,
}: {
  locale: Locale;
  slides: HeroCarouselSlide[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isEnhanced, setIsEnhanced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(media.matches);

    updatePreference();
    setIsEnhanced(true);
    media.addEventListener("change", updatePreference);
    return () => media.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    if (isPaused || reducedMotion || slides.length < 2) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 6000);

    return () => window.clearInterval(timer);
  }, [isPaused, reducedMotion, slides.length]);

  function showPrevious() {
    setActiveIndex((current) => (current - 1 + slides.length) % slides.length);
  }

  function showNext() {
    setActiveIndex((current) => (current + 1) % slides.length);
  }

  const labels =
    locale === "zh"
      ? {
          carousel: "LITA 真实项目图片",
          previous: "上一张",
          next: "下一张",
          goTo: "查看图片",
        }
      : {
          carousel: "LITA real project gallery",
          previous: "Previous",
          next: "Next",
          goTo: "View image",
        };
  const activeSlide = slides[activeIndex];
  const previousIndex = (activeIndex - 1 + slides.length) % slides.length;
  const nextIndex = (activeIndex + 1) % slides.length;
  const renderedIndexes = new Set(
    isEnhanced ? [previousIndex, activeIndex, nextIndex] : [activeIndex],
  );

  return (
    <div
      id="project-gallery"
      aria-label={labels.carousel}
      aria-roledescription="carousel"
      className="group scroll-mt-24"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsPaused(false);
        }
      }}
    >
      <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-[var(--surface-muted)] shadow-[var(--shadow-image)] sm:aspect-[16/8] lg:aspect-[16/7]">
        {slides.map((slide, index) =>
          renderedIndexes.has(index) ? (
            <div
              key={slide.image.src}
              aria-hidden={index !== activeIndex}
              className={`absolute inset-0 transition-opacity duration-700 ease-out ${index === activeIndex ? "opacity-100" : "pointer-events-none opacity-0"}`}
            >
              <Image
                src={slide.image.src}
                alt={slide.image.alt[locale]}
                fill
                sizes="(max-width: 1280px) 100vw, 1280px"
                className="object-cover transition-transform duration-[6000ms] ease-linear group-hover:scale-[1.015]"
              />
            </div>
          ) : null,
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
      </div>

      <div className="mt-5 flex flex-col gap-5 border-b border-[var(--line)] pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[var(--accent-strong)]">
            {activeSlide.location}
          </p>
          <p className="mt-1 font-heading text-xl font-semibold text-[var(--ink)] sm:text-2xl">
            {activeSlide.title}
          </p>
        </div>

        <div className="flex items-center gap-2 sm:justify-end">
          <button
            type="button"
            onClick={showPrevious}
            className="inline-flex min-h-11 items-center px-2 text-sm font-semibold text-[var(--muted)] transition hover:text-[var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
          >
            {labels.previous}
          </button>
          <div className="flex items-center">
            {slides.map((slide, index) => (
              <button
                key={`control-${slide.image.src}`}
                type="button"
                aria-label={`${labels.goTo} ${index + 1}`}
                aria-current={index === activeIndex ? "true" : undefined}
                onClick={() => setActiveIndex(index)}
                className="inline-flex h-11 w-8 items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
              >
                <span
                  className={`h-1 rounded-full transition-all duration-300 ${index === activeIndex ? "w-7 bg-[var(--accent)]" : "w-3 bg-[var(--line)]"}`}
                />
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={showNext}
            className="inline-flex min-h-11 items-center px-2 text-sm font-semibold text-[var(--ink)] transition hover:text-[var(--accent-strong)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
          >
            {labels.next}
          </button>
        </div>
      </div>
    </div>
  );
}
