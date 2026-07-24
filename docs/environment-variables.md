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
- `GHL_ASSESSMENT_OBJECT_SCHEMA_KEY`: server-only Automation Assessment Custom Object key, expected to be `custom_objects.automation_assessment`.
- `GHL_ASSESSMENT_CONTACT_ASSOCIATION_KEY`: server-only Contact association key, expected to be `automation_assessments_submitted_by`.
- `ANALYTICS_PROVIDER`: analytics provider flag if enabled after review.
- `NODE_ENV`: environment mode.

## Current Requirement Status

Most variables are optional in local development. Production lead submission fails closed unless both Turnstile verification and GoHighLevel delivery are operational, so `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`, `GHL_PRIVATE_INTEGRATION_TOKEN`, and `GHL_LOCATION_ID` must be configured before public launch. Email sending and Upstash-backed distributed rate limiting and duplicate suppression should also be configured before launch. Without Upstash, the app falls back to in-memory checks that are useful locally but not durable across Cloudflare Worker isolates.

Automation Assessment submissions require `GHL_ASSESSMENT_OBJECT_SCHEMA_KEY` and `GHL_ASSESSMENT_CONTACT_ASSOCIATION_KEY`. The example values are the expected identifiers, not proof of the live GoHighLevel configuration. Verify both against the location's read-only object-schema and association metadata before enabling assessment submissions, and use the verified values in Cloudflare. These identifiers are not credentials, but they are server-only configuration and must not use a `NEXT_PUBLIC_*` name.

Reuse `GHL_PRIVATE_INTEGRATION_TOKEN`; do not create a second token. In addition to the existing scopes, the same Private Integration must have `associations/relation.readonly`. HighLevel requires that scope to inspect an existing relation after a retry or an ambiguous timeout. Keep the existing `associations/relation.write` scope for relation creation.

The Worker validates the configured schema and association through read-only HighLevel endpoints and caches only the non-secret metadata for 15 minutes in the current Worker isolate. It does not fetch schema metadata for every form submission and does not cache the token, authorization headers, Contact data, or assessment answers. A missing or changed schema or an association orientation mismatch must fail closed with a generic user-facing error. See `docs/gohighlevel-automation-assessment.md` for the complete mapping and recovery contract.

## Transactional Confirmation Email

Customer confirmation email is disabled when `EMAIL_PROVIDER` is empty. When enabled, all of the following are required:

- `EMAIL_PROVIDER` set to `resend` or `postmark`.
- The matching server secret: `RESEND_API_KEY` or `POSTMARK_SERVER_TOKEN`.

Do not configure both provider tokens unless both are operationally needed. The provider named by `EMAIL_PROVIDER` is the only one called. Keep provider tokens server-only and never place them in a `NEXT_PUBLIC_*` variable.

The transactional sender identity is fixed in `lib/site-config.ts` as `Tergion Technologies <notifications@tergion.com>`, with `noreply@tergion.com` as the reply-to address. Email logo and legal links also use the coded production domain. These stable, non-secret brand values do not require Cloudflare variables. The reply-to mailbox is treated as unmonitored; recipients are directed to `contact@tergion.com` when they need to correct a request.

The confirmation is transactional and contains no marketing or unsubscribe link. It is attempted only after the lead passes validation and abuse checks and primary lead processing succeeds. A confirmation provider error is logged without the recipient address, provider response body, or rendered message and does not turn an accepted lead into a failed form submission.
