# Noeliiizi — Free Stash Kit 01

Single-page Next.js site that captures email via Mailchimp and serves the drumkit zip.

## Setup

```bash
npm install
cp .env.local.example .env.local   # fill in Mailchimp creds
npm run dev
```

Required env vars (in `.env.local` or Vercel project settings):

- `MAILCHIMP_API_KEY` — Account → Extras → API keys
- `MAILCHIMP_AUDIENCE_ID` — Audience → Settings → Audience name and defaults
- `MAILCHIMP_SERVER_PREFIX` — the suffix on your API key (e.g. `us21`)

If env vars are missing, the API still returns success so the download works in dev — useful for testing layout without Mailchimp wired up.

## Deploy

Push to GitHub, import in Vercel, paste the three env vars. The 47MB zip is in `/public` and served as a static asset.
