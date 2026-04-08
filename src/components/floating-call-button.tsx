import { siteConfig } from "@/lib/site-config";

type FloatingCallButtonProps = {
  label: string;
};

export function FloatingCallButton({ label }: FloatingCallButtonProps) {
  return (
    <a
      href={siteConfig.phoneHref}
      className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_36px_rgba(249,115,22,0.35)] transition hover:bg-orange-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 md:hidden"
    >
      <span className="inline-block h-2.5 w-2.5 rounded-full bg-white" />
      {label}
    </a>
  );
}
