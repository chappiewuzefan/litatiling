"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    gtag_report_call_conversion?: (url?: string) => boolean;
  }
}

export function GoogleAdsCallTracker() {
  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0) {
        return;
      }

      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      const link = target.closest('a[href^="tel:"]');

      if (!(link instanceof HTMLAnchorElement)) {
        return;
      }

      const href = link.href;

      if (!href || typeof window.gtag_report_call_conversion !== "function") {
        return;
      }

      event.preventDefault();
      window.gtag_report_call_conversion(href);
    }

    document.addEventListener("click", handleClick, true);

    return () => {
      document.removeEventListener("click", handleClick, true);
    };
  }, []);

  return null;
}
