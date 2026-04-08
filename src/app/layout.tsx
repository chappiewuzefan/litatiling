import type { Metadata } from "next";
import { Lexend, Noto_Sans_SC, Source_Sans_3 } from "next/font/google";

import { absoluteUrl, getLanguageAlternates, siteConfig } from "@/lib/site-config";

import "./globals.css";

const lexend = Lexend({
  variable: "--font-heading",
  subsets: ["latin"],
});

const sourceSans = Source_Sans_3({
  variable: "--font-body",
  subsets: ["latin"],
});

const notoSansSc = Noto_Sans_SC({
  variable: "--font-cjk",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
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
        url: absoluteUrl("/social-preview.svg"),
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
    images: [absoluteUrl("/social-preview.svg")],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-AU">
      <body className={`${lexend.variable} ${sourceSans.variable} ${notoSansSc.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
