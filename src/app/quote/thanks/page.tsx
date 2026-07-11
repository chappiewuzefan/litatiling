import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `Project received | ${siteConfig.brandName}`,
  robots: { index: false, follow: false },
};

export default function QuoteThanksPage() {
  return <main className="questionnaire-page flex min-h-screen items-center justify-center px-4 py-12"><section className="w-full max-w-2xl rounded-[1.75rem] border border-slate-300 bg-white p-7 text-center shadow-[0_28px_80px_rgba(15,23,42,0.10)] sm:p-12"><Image src="/lita-logo.webp" alt="Lita Tiling" width={128} height={128} className="mx-auto h-28 w-28 object-contain" priority /><p className="mt-6 text-sm font-bold uppercase tracking-[0.12em] text-amber-700">Submission received</p><h1 className="mt-3 font-heading text-3xl font-semibold text-slate-950 sm:text-5xl">Thank you. We will review your project.</h1><p className="mt-3 text-base text-slate-500">感谢提交，我们将审核您的工程需求。</p><p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-slate-600">LITA Tiling will review the details, photos and plans before contacting you. Your submission is a project brief and does not constitute a final quote or confirmed start date.<span className="mt-2 block text-xs text-slate-500">LITA Tiling 将审核您提交的信息、照片和图纸后与您联系。本次提交仅为工程需求说明，不构成最终报价或开工日期承诺。</span></p><div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><a href={siteConfig.phoneHref} className="rounded-xl bg-slate-950 px-6 py-3 text-sm font-bold text-white">Call {siteConfig.phoneDisplay}</a><Link href="/quote" className="rounded-xl border border-slate-300 px-6 py-3 text-sm font-bold text-slate-900">Submit another project</Link></div></section></main>;
}
