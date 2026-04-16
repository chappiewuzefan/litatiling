export const googleAdsConfig = {
  conversionId:
    process.env.NEXT_PUBLIC_GOOGLE_ADS_ID?.trim() ?? "AW-18092796140",
  callConversionSendTo:
    process.env.NEXT_PUBLIC_GOOGLE_ADS_CALL_SEND_TO?.trim() ??
    "AW-18092796140/Hoo5CJ_S9pwcEOzRqLND",
  leadFormConversionSendTo:
    process.env.NEXT_PUBLIC_GOOGLE_ADS_LEAD_FORM_SEND_TO?.trim() ??
    "AW-18092796140/yI9NCOvr9pwcEOzRqLND",
  callConversionValue: 1,
  leadFormConversionValue: 1,
  currency: "AUD",
};

export function hasGoogleAdsTracking() {
  return Boolean(
    googleAdsConfig.conversionId &&
      googleAdsConfig.callConversionSendTo &&
      googleAdsConfig.leadFormConversionSendTo,
  );
}
