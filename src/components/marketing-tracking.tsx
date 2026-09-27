"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { GoogleAdsCallTracker } from "@/components/google-ads-call-tracker";
import { GoogleAdsLoader } from "@/components/google-ads-loader";
import { googleAdsConfig, hasGoogleAdsTracking } from "@/lib/google-ads";

export function MarketingTracking() {
  const pathname = usePathname();
  const [allowed, setAllowed] = useState(false);
  useEffect(() => {
    setAllowed(window.location.hostname !== "invoice.litatiling.com" && !window.location.pathname.startsWith("/invoice"));
  }, [pathname]);
  const googleAdsEnabled = hasGoogleAdsTracking();
  if (!allowed || pathname.startsWith("/invoice")) return null;
  return <>
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
        <Script
          id="cloudflare-web-analytics"
          type="module"
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon='{"token":"e8372be3336c4f0cb1e3e49b077c0fb3"}'
          strategy="afterInteractive"
        />
  </>;
}
