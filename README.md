# VEYORA

Veyora is a Next.js informational preview for exploring real-world asset categories, due-diligence principles, member learning activities and source-led briefings.

## Run locally

Requires Node.js 20.9 or newer.

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Account access

The sign-in route uses Supabase. Configure these Vercel environment variables before enabling account access:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

The public information pages do not require those variables.

## Current preview boundaries

- No investment product, deposit, withdrawal, cash reward or redemption is available through this site.
- Task completion and points are an in-page demonstration. Progress resets when the visitor leaves; points have no cash value.
- Briefing cards are editorial design previews, not current news. A live feed needs named sources, publication dates, editorial review and an update process.
- The site does not provide investment advice, make return promises or establish that a real asset, operator, control or reporting service has been verified.

## Before a live product

Confirm the business model, assets and counterparties; document fees, valuation, custody, liquidity, eligibility and withdrawal terms; decide how any task reward is funded and paid; define source licensing and news review; and obtain appropriate legal, regulatory, privacy and security review for each target jurisdiction. Do not describe a product as available until these facts and systems are in place.
