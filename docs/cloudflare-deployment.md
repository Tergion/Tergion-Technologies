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

1. Connect the GitHub repository to Cloudflare Workers Builds or deploy from a local authenticated Wrangler session.
2. Use `main` as the production branch.
3. Use `npm ci` for dependency installation.
4. Use `npm run cf:build` as the Workers Builds build command.
5. Use `npm run cf:deploy-only` as the Workers Builds deploy command.
6. Keep the Worker name aligned with `wrangler.jsonc`: `tergion`.
7. Keep `tergion.com` and `www.tergion.com` source-controlled as custom domain routes in `wrangler.jsonc`.
8. Configure `https://tergion.com` as the canonical production URL through `NEXT_PUBLIC_SITE_URL`.

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
