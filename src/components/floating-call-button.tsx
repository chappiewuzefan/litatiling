import React from "react";

import {
  getPhoneLabels,
  siteConfig,
  type Locale,
} from "@/lib/site-config";

type FloatingCallButtonProps = {
  locale: Locale;
};

export function FloatingCallButton({ locale }: FloatingCallButtonProps) {
  const phoneLabels = getPhoneLabels(locale);

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-2 md:hidden">
      {siteConfig.phoneContacts.map((phone) => (
        <a
          key={phone.kind}
          href={phone.href}
          aria-label={`${phoneLabels[phone.kind].short} · ${phone.display}`}
          className={`inline-flex min-h-11 items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold shadow-[0_16px_36px_rgba(15,23,42,0.28)] transition focus-visible:outline-none focus-visible:ring-2 ${
            phone.kind === "primary"
              ? "bg-[var(--accent)] text-[#251208] hover:brightness-105 focus-visible:ring-[var(--accent-strong)]"
              : "border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] hover:bg-[var(--surface-muted)] focus-visible:ring-[var(--accent)]"
          }`}
        >
          {phoneLabels[phone.kind].short} · {phone.display}
        </a>
      ))}
    </div>
  );
}
