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
- Distributed rate limit credentials when production persistence is enabled

Keep server-only values as Cloudflare secrets.

## Verification

After deployment:

1. Open `https://tergion.com`.
2. Open `https://tergion.com/api/health` and confirm `ok: true`.
3. Open `https://www.tergion.com/api/health` and confirm `ok: true`.
4. Submit a test lead using non-production contact details.
5. Confirm the response does not expose provider errors.
6. Check Cloudflare logs for Worker exceptions.
