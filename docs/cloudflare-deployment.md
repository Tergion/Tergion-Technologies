# Cloudflare Deployment

## Target

This site deploys to Cloudflare Workers through the OpenNext Cloudflare adapter.

- Production domain: `https://tergion.com`
- Worker name: `tergion-technologies`
- Runtime config: `wrangler.jsonc`
- Build output: `.open-next`
- Required Node.js version: `22.16.0` or newer

## Commands

```bash
npm ci
npm run lint
npm run typecheck
npm run build
npm run cf:build
npm run cf:preview
npm run cf:deploy
```

Use `npm run cf:upload` when you want to upload a Worker version without immediately promoting it.

## Cloudflare Setup

1. Connect the GitHub repository to Cloudflare Workers Builds or deploy from a local authenticated Wrangler session.
2. Use `main` as the production branch.
3. Use `npm ci` for dependency installation.
4. Use `npm run cf:deploy` as the deployment command.
5. Keep the Worker name aligned with `wrangler.jsonc`: `tergion-technologies`.
6. Attach `tergion.com` and `www.tergion.com` to the Worker route or custom domain configuration.
7. Configure `https://tergion.com` as the canonical production URL through `NEXT_PUBLIC_SITE_URL`.

## Runtime Settings

`wrangler.jsonc` tracks the required Cloudflare runtime settings:

- `nodejs_compat`
- `global_fetch_strictly_public`
- `.open-next/worker.js` as the Worker entrypoint
- `.open-next/assets` as the static asset directory

Do not manually change these values in the dashboard without also updating the repo config.

## Environment Variables And Secrets

Set production values in Cloudflare before enabling live lead capture:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SITE_NAME`
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
- `TURNSTILE_SECRET_KEY`
- `LEAD_NOTIFICATION_EMAIL`
- `LEAD_FROM_EMAIL`
- Email provider credentials when email sending is enabled
- Google Sheets credentials when Sheets append is enabled
- Distributed rate limit credentials when production persistence is enabled

Keep server-only values as Cloudflare secrets.

## Verification

After deployment:

1. Open `https://tergion.com`.
2. Open `https://tergion.com/api/health` and confirm `ok: true`.
3. Submit a test lead using non-production contact details.
4. Confirm the response does not expose provider errors.
5. Check Cloudflare logs for Worker exceptions.
