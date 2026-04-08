"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

import type { Locale } from "@/lib/site-config";

type TurnstileWidgetProps = {
  siteKey: string;
  locale: Locale;
  label: string;
  resetCounter: number;
  onTokenChange: (token: string) => void;
};

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: Record<string, unknown>,
      ) => string | number;
      reset: (widgetId?: string | number) => void;
      remove?: (widgetId: string | number) => void;
    };
  }
}

export function TurnstileWidget({
  siteKey,
  locale,
  label,
  resetCounter,
  onTokenChange,
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | number | null>(null);
  const [scriptReady, setScriptReady] = useState(false);

  useEffect(() => {
    if (window.turnstile) {
      setScriptReady(true);
    }
  }, []);

  useEffect(() => {
    if (
      !scriptReady ||
      !containerRef.current ||
      widgetIdRef.current !== null ||
      !window.turnstile
    ) {
      return;
    }

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      action: "contact_form",
      theme: "light",
      language: locale === "zh" ? "zh-CN" : "en",
      callback: (token: string) => onTokenChange(token),
      "expired-callback": () => onTokenChange(""),
      "error-callback": () => onTokenChange(""),
    });

    return () => {
      if (widgetIdRef.current !== null) {
        window.turnstile?.remove?.(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [locale, onTokenChange, scriptReady, siteKey]);

  useEffect(() => {
    if (resetCounter === 0 || widgetIdRef.current === null) {
      return;
    }

    window.turnstile?.reset(widgetIdRef.current);
    onTokenChange("");
  }, [onTokenChange, resetCounter]);

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-slate-800">{label}</p>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
      />
      <div ref={containerRef} />
    </div>
  );
}
