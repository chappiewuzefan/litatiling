"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function HomeMotion() {
  useGSAP(() => {
    const root = document.querySelector<HTMLElement>("[data-home-page]");
    if (!root) return;

    const select = gsap.utils.selector(root);
    const media = gsap.matchMedia();

    media.add(
      "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
      () => {
        gsap.utils.toArray<HTMLElement>(select("[data-hero-photo]")).forEach(
          (frame, index) => {
            const image = frame.querySelector("img");
            if (!image) return;

            gsap.fromTo(
              image,
              {
                scale: 1.04,
                yPercent: index === 1 ? -2 : 2,
              },
              {
                scale: 1.08,
                yPercent: index === 1 ? 3 : -3,
                ease: "none",
                scrollTrigger: {
                  trigger: root,
                  start: "top top",
                  end: "bottom top",
                  scrub: 0.8,
                },
              },
            );
          },
        );

        gsap.utils
          .toArray<HTMLElement>(select("[data-project-image]"))
          .forEach((image) => {
            gsap.fromTo(
              image,
              { opacity: 0.45, scale: 0.88 },
              {
                opacity: 1,
                scale: 1,
                ease: "none",
                scrollTrigger: {
                  trigger: image,
                  start: "top 90%",
                  end: "bottom 35%",
                  scrub: true,
                },
              },
            );
          });

        gsap.utils
          .toArray<HTMLElement>(
            select("[data-service-image], [data-ambient-image]"),
          )
          .forEach((frame) => {
            const image = frame.querySelector("img");
            if (!image) return;

            gsap.fromTo(
              image,
              { opacity: 0.62, scale: 1.08, yPercent: 3 },
              {
                opacity: 1,
                scale: 1,
                yPercent: 0,
                duration: 1.1,
                ease: "power3.out",
                scrollTrigger: {
                  trigger: frame,
                  start: "top 86%",
                  once: true,
                },
              },
            );
          });
      },
    );

    media.add(
      "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
      () => {
        const stack = root.querySelector<HTMLElement>("[data-process-stack]");
        const cards = gsap.utils.toArray<HTMLElement>(
          select("[data-process-card]"),
        );

        if (!stack || cards.length < 2) return;

        gsap.set(cards.slice(1), { yPercent: 112 });
        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: stack,
            start: "top top",
            end: `+=${cards.length * 72}%`,
            pin: true,
            scrub: 0.8,
            anticipatePin: 1,
          },
        });

        cards.slice(1).forEach((card, index) => {
          timeline.to(
            card,
            {
              yPercent: index * 2.5,
              ease: "none",
              duration: 1,
            },
            index,
          );
        });

        return () => timeline.kill();
      },
    );

    return () => media.revert();
  });

  return null;
}
