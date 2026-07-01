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
- `GHL_API_KEY`: GoHighLevel API key if integrated later.
- `GHL_LOCATION_ID`: GoHighLevel location identifier if integrated later.
- `UPSTASH_REDIS_REST_URL`: Upstash REST URL for production rate limiting.
- `UPSTASH_REDIS_REST_TOKEN`: Upstash REST token.

## Operational Config

- `GOOGLE_SHEETS_WORKSHEET_NAME`: worksheet name, defaults to `Leads`.
- `EMAIL_PROVIDER`: expected values later include `resend` or `postmark`.
- `LEAD_NOTIFICATION_EMAIL`: internal lead notification recipient.
- `LEAD_FROM_EMAIL`: sender identity for transactional email.
- `ANALYTICS_PROVIDER`: analytics provider flag if enabled after review.
- `NODE_ENV`: environment mode.

## Current Requirement Status

Most variables are optional in local development. Production should configure Turnstile, a lead destination, email sending, and distributed rate limiting before public launch.
