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
- `EMAIL_PROVIDER`: transactional email provider; supported values are `resend` and `postmark`.
- `LEAD_NOTIFICATION_EMAIL`: future internal lead notification recipient. Internal notification sending remains deferred and this value does not gate customer confirmation.
- `GHL_SOURCE`: GoHighLevel contact source, defaults to `Tergion website lead form`.
- `GHL_LEAD_TAGS`: comma-separated GoHighLevel tags to add after contact upsert, defaults to `website-lead`.
- `ANALYTICS_PROVIDER`: analytics provider flag if enabled after review.
- `NODE_ENV`: environment mode.

## Current Requirement Status

Most variables are optional in local development. Production should configure these values as Cloudflare Worker variables or secrets before public launch, especially Turnstile, GoHighLevel lead sync, email sending, and Upstash-backed distributed rate limiting and duplicate suppression. Without Upstash, the app falls back to in-memory checks that are useful locally but not durable across Cloudflare Worker isolates.

## Transactional Confirmation Email

Customer confirmation email is disabled when `EMAIL_PROVIDER` is empty. When enabled, all of the following are required:

- `EMAIL_PROVIDER` set to `resend` or `postmark`.
- The matching server secret: `RESEND_API_KEY` or `POSTMARK_SERVER_TOKEN`.

Do not configure both provider tokens unless both are operationally needed. The provider named by `EMAIL_PROVIDER` is the only one called. Keep provider tokens server-only and never place them in a `NEXT_PUBLIC_*` variable.

The transactional sender identity is fixed in `lib/site-config.ts` as `Tergion Technologies <no-reply@tergion.com>`, with `no-reply@tergion.com` as the reply-to address. Email logo and legal links also use the coded production domain. These stable, non-secret brand values do not require Cloudflare variables. The no-reply mailbox is treated as automated and unmonitored; recipients are directed to `contact@tergion.com` when they need to correct a request.

The confirmation is transactional and contains no marketing or unsubscribe link. It is attempted only after the lead passes validation and abuse checks and primary lead processing succeeds. A confirmation provider error is logged without the recipient address, provider response body, or rendered message and does not turn an accepted lead into a failed form submission.
