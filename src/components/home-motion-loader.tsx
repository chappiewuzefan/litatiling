"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const HomeMotion = dynamic(() => import("@/components/home-motion"), {
  ssr: false,
});

export function HomeMotionLoader() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(
      "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
    );

    if (!media.matches) return;

    const timer = window.setTimeout(() => setReady(true), 3000);
    return () => window.clearTimeout(timer);
  }, []);

  return ready ? <HomeMotion /> : null;
}
