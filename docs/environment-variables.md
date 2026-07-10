# Environment Variables

## Public Safe

- `NEXT_PUBLIC_SITE_URL`: public canonical site URL.
- `NEXT_PUBLIC_SITE_NAME`: public site name.
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`: public Cloudflare Turnstile site key.
- `NEXT_PUBLIC_GHL_LOGIN_URL`: optional public client login URL.
- `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`: optional public analytics domain.
- `NEXT_PUBLIC_POSTHOG_KEY`: optional public PostHog key.
- `NEXT_PUBLIC_POSTHOG_HOST`: optional public PostHog host.

## Server-Only Secrets

- `TURNSTILE_SECRET_KEY`: server-side Turnstile verification secret.
- `GOOGLE_SHEETS_CLIENT_EMAIL`: Google service account email.
- `GOOGLE_SHEETS_PRIVATE_KEY`: Google service account private key.
- `GOOGLE_SHEETS_SPREADSHEET_ID`: destination spreadsheet ID.
- `RESEND_API_KEY`: Resend API key if Resend is selected.
- `POSTMARK_SERVER_TOKEN`: Postmark token if Postmark is selected.
- `GHL_PRIVATE_INTEGRATION_TOKEN`: preferred GoHighLevel Private Integration token for lead contact sync.
- `GHL_API_KEY`: legacy fallback for the GoHighLevel token value.
- `GHL_LOCATION_ID`: GoHighLevel sub-account/location identifier for lead contact sync.
- `UPSTASH_REDIS_REST_URL`: Upstash REST URL for production rate limiting and duplicate suppression.
- `UPSTASH_REDIS_REST_TOKEN`: Upstash REST token for production rate limiting and duplicate suppression.

## Operational Config

- `NEXTJS_ENV`: OpenNext environment mode for local Wrangler preview. Use `development` locally.
- `GOOGLE_SHEETS_WORKSHEET_NAME`: worksheet name, defaults to `Leads`.
- `EMAIL_PROVIDER`: expected values later include `resend` or `postmark`.
- `LEAD_NOTIFICATION_EMAIL`: internal lead notification recipient.
- `LEAD_FROM_EMAIL`: sender identity for transactional email.
- `GHL_SOURCE`: GoHighLevel contact source, defaults to `Tergion website lead form`.
- `GHL_LEAD_TAGS`: comma-separated GoHighLevel tags to add after contact upsert, defaults to `website-lead`.
- `ANALYTICS_PROVIDER`: analytics provider flag if enabled after review.
- `NODE_ENV`: environment mode.

## Current Requirement Status

Most variables are optional in local development. Production should configure these values as Cloudflare Worker variables or secrets before public launch, especially Turnstile, GoHighLevel lead sync, email sending, and Upstash-backed distributed rate limiting and duplicate suppression. Without Upstash, the app falls back to in-memory checks that are useful locally but not durable across Cloudflare Worker isolates.
