# LITA Tiling Canberra

Bilingual `Next.js 15` landing page for a Canberra residential tiling and waterproofing business.

Public business defaults in this repo:

- Brand: `LITA Tiling Canberra`
- Legal entity: `LITA CONSTRUCTION PTY LTD`
- Phone: `0435 248 809`
- Email: `litamia810@gmail.com`
- Recommended production URL candidate: `https://www.litatiling.com`

The site currently ships with:

- `/en` and `/zh` language routes
- localized SEO metadata and `hreflang`
- `robots.txt` and `sitemap.xml`
- `LocalBusiness` structured data
- Firebase-backed contact lead capture
- phone-based lead deduplication
- optional SMTP email notifications for new leads
- optional Cloudflare Turnstile bot protection
- server-side rate limiting for `/api/contact`
- privacy and thank-you pages
- selected project images wired into the homepage

## Core positioning

The homepage is written for Canberra homeowners looking for:

- floor tiling
- wall tiling
- bathroom tiling and waterproofing
- splashbacks
- silicone sealing and regrouting
- stone cladding and feature columns
- swimming pool tiling
- repairs and tile replacement

## Run locally

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open:

- [http://localhost:3000/en](http://localhost:3000/en)
- [http://localhost:3000/zh](http://localhost:3000/zh)

The root path redirects to `/en`.

## Main files to edit

- `src/lib/site-config.ts`
  - site URL
  - public brand name
  - legal company name
  - phone and email
  - Canberra service areas
- `src/lib/content.ts`
  - English and Chinese page copy
  - services
  - FAQ
  - project summaries
  - contact form labels
- `src/lib/gallery.ts`
  - selected image mapping and alt text
- `public/social-preview.svg`
  - social share artwork

## Image workflow

Raw downloads stay here:

- `public/case-studies/unsorted`

Only site-ready images should be used from here:

- `public/case-studies/selected/hero`
- `public/case-studies/selected/projects`
- `public/case-studies/selected/process`

Current homepage project images are mapped in `src/lib/gallery.ts`.

## Environment variables

Create `.env.local` from `.env.example`.

### Public variables

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_BRAND_NAME`
- `NEXT_PUBLIC_LEGAL_NAME`
- `NEXT_PUBLIC_PHONE_DISPLAY`
- `NEXT_PUBLIC_CONTACT_EMAIL`

### Firebase Admin variables

- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `FIREBASE_STORAGE_BUCKET`
- `FIREBASE_CONTACT_COLLECTION`

### SMTP notification variables

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`
- `NOTIFICATION_TO`

### Turnstile variables

- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
- `TURNSTILE_SECRET_KEY`

### Google Ads conversion variables

- `NEXT_PUBLIC_GOOGLE_ADS_ID`
- `NEXT_PUBLIC_GOOGLE_ADS_CALL_SEND_TO`
- `NEXT_PUBLIC_GOOGLE_ADS_LEAD_FORM_SEND_TO`

### Contact API rate limit variables

- `RATE_LIMIT_MAX_REQUESTS`
- `RATE_LIMIT_WINDOW_SECONDS`
- `FIREBASE_RATE_LIMIT_COLLECTION`

If Firebase Admin credentials are missing:

- in development, the contact form returns a mock success response
- in production, the form returns an error and asks the customer to call or email directly

If SMTP credentials are missing:

- lead data is still written to Firestore
- email notification is skipped
- duplicates are still suppressed by phone number

If Turnstile variables are missing:

- the form still works
- bot protection stays disabled until both keys are configured and redeployed

If Google Ads variables are missing:

- the site falls back to the current LITA Google Ads conversion IDs baked into the app
- the website still works normally
- set the variables only if you want to override those defaults later

If rate limit variables are missing:

- `/api/contact` defaults to `3` submissions per `10` minutes per IP address
- rate-limit counters are stored in Firestore under `contactRateLimits`

## Cloudflare Turnstile setup

1. In Cloudflare, open `Turnstile`.
2. Create a widget for:
   - `www.litatiling.com`
   - `litatiling--lita-tiling.asia-southeast1.hosted.app` if you still want the default Firebase domain for testing
3. Copy the `site key` into `NEXT_PUBLIC_TURNSTILE_SITE_KEY`.
4. Copy the `secret key` into `TURNSTILE_SECRET_KEY`.
5. Redeploy the site after updating App Hosting environment variables.

The form verifies Turnstile server-side before writing the lead to Firestore.

## Google Ads conversion setup

This site supports two Google Ads conversions:

- click-to-call on any `tel:` link
- successful lead-form submission after `/api/contact` returns success

Optionally set these App Hosting environment variables and redeploy if you want to override the built-in values:

1. `NEXT_PUBLIC_GOOGLE_ADS_ID`
2. `NEXT_PUBLIC_GOOGLE_ADS_CALL_SEND_TO`
3. `NEXT_PUBLIC_GOOGLE_ADS_LEAD_FORM_SEND_TO`

Current expected values from the configured Google Ads account are:

- `NEXT_PUBLIC_GOOGLE_ADS_ID=AW-18092796140`
- `NEXT_PUBLIC_GOOGLE_ADS_CALL_SEND_TO=AW-18092796140/Hoo5CJ_S9pwcEOzRqLND`
- `NEXT_PUBLIC_GOOGLE_ADS_LEAD_FORM_SEND_TO=AW-18092796140/yI9NCOvr9pwcEOzRqLND`

Behavior:

- every phone link click can trigger the click-to-call conversion
- a lead-form conversion is sent only after the form submission succeeds
- the customer is then redirected to the thank-you page

## Checks

```bash
npm run lint
npm run typecheck
npm run build
```

## Launch checklist

- confirm the final production domain is registered and connected
- confirm the legal company spelling is exactly correct for public use
- replace any inferred case study details with exact suburb and scope information if needed
- review the English and Chinese copy in a browser on desktop and mobile
- configure Firebase Admin credentials
- configure SMTP credentials for lead emails
- submit the sitemap in Google Search Console
- connect Bing Webmaster Tools and IndexNow
- confirm the host allows `OAI-SearchBot`

## Notes

- The current domain in config is a recommended SEO-friendly candidate, not a verified registration result.
- The case study text is launch-ready, but some suburb and scope wording was inferred from the image library and can be tightened later.
