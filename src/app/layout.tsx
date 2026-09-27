import type { Metadata } from "next";
import { Outfit, Source_Sans_3 } from "next/font/google";
import { MarketingTracking } from "@/components/marketing-tracking";

import {
  absoluteUrl,
  getLanguageAlternates,
  siteConfig,
  socialPreviewPath,
} from "@/lib/site-config";

import "./globals.css";

const outfit = Outfit({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: "600",
  display: "swap",
});

const sourceSans = Source_Sans_3({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: siteConfig.brandName,
  description:
    "Licensed Canberra residential tiling for bathrooms, floors, walls, waterproofing, silicone, stone cladding and pool tiling.",
  applicationName: siteConfig.brandName,
  alternates: {
    languages: getLanguageAlternates(),
  },
  openGraph: {
    title: siteConfig.brandName,
    description:
      "Canberra floor tiling, wall tiling, bathroom waterproofing, silicone sealing, stone cladding and pool tiling with English and Chinese support.",
    siteName: siteConfig.brandName,
    url: siteConfig.siteUrl,
    type: "website",
    images: [
      {
        url: absoluteUrl(socialPreviewPath),
        width: 1200,
        height: 630,
        alt: siteConfig.brandName,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.brandName,
    description:
      "Canberra floor tiling, wall tiling, bathroom waterproofing, silicone sealing, stone cladding and pool tiling with English and Chinese support.",
    images: [absoluteUrl(socialPreviewPath)],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-AU">
      <body className={`${outfit.variable} ${sourceSans.variable} antialiased`}>
        <MarketingTracking />
        {children}
      </body>
    </html>
  );
}
