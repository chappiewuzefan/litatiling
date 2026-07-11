import type { Metadata } from "next";

import { QuestionnaireForm } from "@/components/questionnaire-form";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `Tiling Project Questionnaire | ${siteConfig.brandName}`,
  description: "Tell LITA Tiling about your Canberra tiling project, room specifications, materials and site conditions.",
  alternates: { canonical: "https://quote.litatiling.com/" },
  robots: { index: false, follow: false },
};

export default function QuotePage() {
  return <main className="questionnaire-page min-h-screen px-3 py-5 sm:px-6 sm:py-10"><QuestionnaireForm /></main>;
}
