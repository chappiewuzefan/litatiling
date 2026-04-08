import { notFound } from "next/navigation";

import { getHtmlLang, isLocale, locales } from "@/lib/site-config";

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return <div lang={getHtmlLang(locale)}>{children}</div>;
}
