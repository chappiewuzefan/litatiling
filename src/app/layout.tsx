import type { Metadata } from "next";
import { Outfit, Source_Sans_3 } from "next/font/google";
import Script from "next/script";

import { GoogleAdsCallTracker } from "@/components/google-ads-call-tracker";
import { GoogleAdsLoader } from "@/components/google-ads-loader";
import { googleAdsConfig, hasGoogleAdsTracking } from "@/lib/google-ads";
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
  const googleAdsEnabled = hasGoogleAdsTracking();

  return (
    <html lang="en-AU">
      <body className={`${outfit.variable} ${sourceSans.variable} antialiased`}>
        {googleAdsEnabled ? (
          <>
            <Script id="google-ads-gtag-config" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                window.gtag = window.gtag || gtag;
                gtag('js', new Date());
                gtag('config', '${googleAdsConfig.conversionId}');

                window.googleAdsReportConversion = function(sendTo, options) {
                  options = options || {};
                  var completed = false;
                  var callback = function () {
                    if (completed) return;
                    completed = true;
                    window.clearTimeout(fallbackTimer);
                    if (typeof options.callback === 'function') {
                      options.callback();
                    } else if (typeof options.url !== 'undefined') {
                      window.location = options.url;
                    }
                  };
                  var fallbackTimer = window.setTimeout(callback, 1500);

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
            <GoogleAdsLoader />
            <GoogleAdsCallTracker />
          </>
        ) : null}
        {children}
        <Script
          id="cloudflare-web-analytics"
          type="module"
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon='{"token":"e8372be3336c4f0cb1e3e49b077c0fb3"}'
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
