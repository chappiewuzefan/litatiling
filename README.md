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
- a bilingual smart project questionnaire at `/quote`
- private project attachments, Firestore submission records and bilingual PDF summaries

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

## Project questionnaire

The questionnaire is designed for `https://quote.litatiling.com` and remains available at `/quote` on the primary backend.

- English is primary, with smaller Chinese translations under every customer-facing question and option.
- Each selected work area keeps an independent technical scope.
- Conditional questions hide and clear answers that no longer apply.
- `POST /api/questionnaire` creates a draft in `questionnaireSubmissions`.
- Attachments are stored privately under `questionnaire-submissions/{submissionId}/attachments/`.
- Finalization creates a searchable bilingual PDF under `questionnaire-submissions/{submissionId}/summary/`, marks the record `submitted`, and sends expiring private links to `NOTIFICATION_TO`.
- Every submission is a new project record, even when a mobile number was previously used.
- The questionnaire does not calculate or promise a quote or start date.

Accepted uploads are JPG, PNG, WEBP, HEIC/HEIF and PDF, with a maximum of 10 files and 10 MB per file. The server verifies file content instead of trusting the browser MIME value.

Before launch:

1. Add `quote.litatiling.com` to the existing Firebase App Hosting backend.
2. Copy the Firebase-provided DNS records into Cloudflare and wait for certificate provisioning.
3. Add `quote.litatiling.com` to the existing Cloudflare Turnstile widget hostnames.
4. Confirm the App Hosting service account can use Firestore, Storage and signed URLs.

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
- `public/social-preview.webp`
  - social share artwork

## SEO and guide publishing

The public marketing site now uses a bilingual, static content structure:

- `/{locale}/services` and `/{locale}/services/{slug}` for high-intent service pages
- `/{locale}/guides` and `/{locale}/guides/{slug}` for homeowner education
- `/{locale}/about` for business context
- `/{locale}/service-areas` for the real Canberra service area

Guide source files live under `src/content/guides/en` and `src/content/guides/zh`.
Each translation pair uses the same `slug` and `translationKey`. Required frontmatter:

```yaml
locale: "en"
slug: "example-guide"
translationKey: "example-guide"
title: "Example title"
description: "Search description"
excerpt: "Card and article introduction"
category: "Project planning"
heroImage: "/case-studies/selected/projects/example.webp"
heroAlt: "Useful, specific image description"
publishedAt: "2026-07-17"
updatedAt: "2026-07-17"
status: "published"
featured: false
sources:
  - title: "Source title"
    url: "https://example.gov.au/source"
    publisher: "Source publisher"
```

Publishing rules:

- keep drafts as `status: "draft"`; drafts do not receive routes or sitemap entries
- add both English and Chinese files before publishing
- use LITA-owned images only
- use external pages for research and attribution, not copied or lightly translated body text
- verify technical claims against current Australian primary sources or product documentation
- do not add prices, fixed completion times, diagnoses, ratings or credentials that have not been confirmed
- run the full check suite before publishing; content validation checks fields, dates, sources, images, unique routes and language pairs

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
- `FIREBASE_QUESTIONNAIRE_COLLECTION`
- `FIREBASE_QUESTIONNAIRE_RATE_LIMIT_COLLECTION`

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
npm test
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
