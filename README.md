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

If Firebase Admin credentials are missing:

- in development, the contact form returns a mock success response
- in production, the form returns an error and asks the customer to call or email directly

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
- submit the sitemap in Google Search Console
- connect Bing Webmaster Tools and IndexNow
- confirm the host allows `OAI-SearchBot`

## Notes

- The current domain in config is a recommended SEO-friendly candidate, not a verified registration result.
- The case study text is launch-ready, but some suburb and scope wording was inferred from the image library and can be tightened later.
