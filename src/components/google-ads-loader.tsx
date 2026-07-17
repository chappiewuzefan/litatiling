"use client";

import { useEffect } from "react";

import { googleAdsConfig } from "@/lib/google-ads";

const scriptId = "google-ads-gtag-src";

export function GoogleAdsLoader() {
  useEffect(() => {
    let loaded = false;
    const interactionEvents: Array<keyof WindowEventMap> = [
      "pointerdown",
      "keydown",
      "focusin",
    ];

    function removeInteractionListeners() {
      interactionEvents.forEach((eventName) => {
        window.removeEventListener(eventName, loadScript, true);
      });
    }

    function loadScript() {
      if (loaded || document.getElementById(scriptId)) {
        removeInteractionListeners();
        return;
      }

      loaded = true;
      removeInteractionListeners();

      const script = document.createElement("script");
      script.id = scriptId;
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(googleAdsConfig.conversionId)}`;
      document.head.appendChild(script);
    }

    interactionEvents.forEach((eventName) => {
      window.addEventListener(eventName, loadScript, true);
    });

    const timeout = window.setTimeout(loadScript, 8000);

    return () => {
      window.clearTimeout(timeout);
      removeInteractionListeners();
    };
  }, []);

  return null;
}
