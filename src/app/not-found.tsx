import Link from "next/link";

export default function NotFound() {
  return (
    <main className="section-shell flex min-h-[70vh] items-center justify-center py-20">
      <div className="max-w-2xl rounded-[2rem] border border-slate-200 bg-white p-10 text-center shadow-[0_24px_70px_rgba(15,23,42,0.06)]">
        <p className="section-eyebrow">404</p>
        <h1 className="mt-4 font-heading text-4xl font-semibold text-slate-950">
          Page not found
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-600">
          This page does not exist. Return to the English or Chinese homepage.
        </p>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/en"
            className="inline-flex items-center justify-center rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            English home
          </Link>
          <Link
            href="/zh"
            className="inline-flex items-center justify-center rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
          >
            中文首页
          </Link>
        </div>
      </div>
    </main>
  );
}
