import type { Metadata } from "next";
import { Lexend, Noto_Sans_SC, Source_Sans_3 } from "next/font/google";
import Script from "next/script";

import { GoogleAdsCallTracker } from "@/components/google-ads-call-tracker";
import { googleAdsConfig, hasGoogleAdsTracking } from "@/lib/google-ads";
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
  const googleAdsEnabled = hasGoogleAdsTracking();

  return (
    <html lang="en-AU">
      <body className={`${lexend.variable} ${sourceSans.variable} ${notoSansSc.variable} antialiased`}>
        {googleAdsEnabled ? (
          <>
            <Script
              id="google-ads-gtag-src"
              src={`https://www.googletagmanager.com/gtag/js?id=${googleAdsConfig.conversionId}`}
              strategy="afterInteractive"
            />
            <Script id="google-ads-gtag-config" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                window.gtag = window.gtag || gtag;
                gtag('js', new Date());
                gtag('config', '${googleAdsConfig.conversionId}');

                window.googleAdsReportConversion = function(sendTo, options) {
                  options = options || {};
                  var callback = function () {
                    if (typeof options.callback === 'function') {
                      options.callback();
                    } else if (typeof options.url !== 'undefined') {
                      window.location = options.url;
                    }
                  };

                  gtag('event', 'conversion', {
                    'send_to': sendTo,
                    'value': typeof options.value === 'number' ? options.value : ${googleAdsConfig.callConversionValue},
                    'currency': options.currency || '${googleAdsConfig.currency}',
                    'event_callback': callback
                  });
                  return false;
                };

                window.gtag_report_call_conversion = function(url) {
                  return window.googleAdsReportConversion('${googleAdsConfig.callConversionSendTo}', {
                    url: url,
                    value: ${googleAdsConfig.callConversionValue},
                    currency: '${googleAdsConfig.currency}'
                  });
                };

                window.gtag_report_lead_form_conversion = function(callback) {
                  return window.googleAdsReportConversion('${googleAdsConfig.leadFormConversionSendTo}', {
                    callback: callback,
                    value: ${googleAdsConfig.leadFormConversionValue},
                    currency: '${googleAdsConfig.currency}'
                  });
                };
              `}
            </Script>
            <GoogleAdsCallTracker />
          </>
        ) : null}
        {children}
      </body>
    </html>
  );
}
