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
          aria-label={`${phoneLabels[phone.kind].action}: ${phone.display}`}
          className={`inline-flex min-h-11 items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold shadow-[0_16px_36px_rgba(15,23,42,0.28)] transition focus-visible:outline-none focus-visible:ring-2 ${
            phone.kind === "primary"
              ? "bg-orange-700 text-white hover:bg-orange-600 focus-visible:ring-orange-300"
              : "border border-white/20 bg-slate-950 text-white hover:bg-slate-800 focus-visible:ring-sky-300"
          }`}
        >
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-white" />
          {phoneLabels[phone.kind].short} · {phone.display}
        </a>
      ))}
    </div>
  );
}
