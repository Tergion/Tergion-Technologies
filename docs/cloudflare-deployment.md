# Cloudflare Deployment

## Target

This site deploys to Cloudflare Workers through the OpenNext Cloudflare adapter.

- Production domain: `https://tergion.com`
- Worker name: `tergion`
- Runtime config: `wrangler.jsonc`
- Worker domains: `tergion.com`, `www.tergion.com`
- Build output: `.open-next`
- Required Node.js version: `22.16.0` or newer

## Commands

```bash
npm ci
npm run lint
npm run test
npm run typecheck
npm run build
npm run cf:build
npm run test:e2e
npm run cf:preview
npm run cf:deploy
npm run cf:deploy-only
```

Use `npm run cf:upload` when you want to upload a Worker version without immediately promoting it.

## Cloudflare Setup

1. Disable Cloudflare Workers Builds automatic Git deployments for this Worker so production deploys cannot bypass GitHub CI.
2. Use GitHub Actions as the production deployment path from `main`.
3. Configure GitHub repository secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.
4. Configure GitHub repository variables `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SITE_NAME`, and `NEXT_PUBLIC_TURNSTILE_SITE_KEY` for production builds.
5. Keep server-only runtime secrets, including `TURNSTILE_SECRET_KEY`, `GHL_PRIVATE_INTEGRATION_TOKEN`, and `GHL_LOCATION_ID`, in Cloudflare Worker secrets.
6. Protect `main` in GitHub and require the `Verify` status check before merging.
7. Keep the Worker name aligned with `wrangler.jsonc`: `tergion`.
8. Keep `tergion.com` and `www.tergion.com` source-controlled as custom domain routes in `wrangler.jsonc`.
9. Configure `https://tergion.com` as the canonical production URL through `NEXT_PUBLIC_SITE_URL`.

The GitHub Actions `Deploy production` job depends on the `Verify` job. A Worker deploy will not run unless lint, typecheck, unit and route tests, production build, Cloudflare build, and Playwright E2E tests pass first.

## Runtime Settings

`wrangler.jsonc` tracks the required Cloudflare runtime settings:

- `nodejs_compat`
- `global_fetch_strictly_public`
- `.open-next/worker.js` as the Worker entrypoint
- `.open-next/assets` as the static asset directory
- `tergion.com` and `www.tergion.com` as custom domain routes
- `workers_dev: false` so production only publishes to the custom domains

Do not manually change these values in the dashboard without also updating the repo config.

## Environment Variables And Secrets

Set production values in Cloudflare before enabling live lead capture:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SITE_NAME`
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
- `TURNSTILE_SECRET_KEY`
- `LEAD_NOTIFICATION_EMAIL`
- `LEAD_FROM_EMAIL`
- `GHL_PRIVATE_INTEGRATION_TOKEN`
- `GHL_LOCATION_ID`
- Email provider credentials when email sending is enabled
- Google Sheets credentials when Sheets append is enabled
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

Keep server-only values as Cloudflare secrets.

## Lead Form Abuse Protection

The application includes local in-memory fallbacks for development, but
production lead capture should configure Upstash Redis so rate limits and
duplicate suppression survive across Cloudflare Worker isolates and regions.

Configured production rules:

- Same email: 1 request per 15 minutes and 3 requests per 24 hours.
- Same phone: 1 request per 15 minutes and 3 requests per 24 hours.
- Same client signal: 3 requests per hour and 10 requests per 24 hours.

Recommended Cloudflare dashboard hardening:

1. Enable Turnstile with production keys and set both
   `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY`.
2. Add a WAF or rate-limiting rule scoped to `http.request.uri.path eq "/api/leads"`.
3. Start with a conservative challenge or block threshold above normal human use,
   such as repeated POST requests to `/api/leads` from the same IP in a short
   period.
4. Monitor Cloudflare events and Worker logs before tightening thresholds.

## Verification

After deployment:

1. Open `https://tergion.com`.
2. Open `https://tergion.com/api/health` and confirm `ok: true`.
3. Open `https://www.tergion.com/api/health` and confirm `ok: true`.
4. Submit a test lead using non-production contact details.
5. Confirm the response does not expose provider errors.
6. Check Cloudflare logs for Worker exceptions.
