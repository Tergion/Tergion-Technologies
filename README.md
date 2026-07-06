# Tergion Technologies Website

Professional B2B website foundation for Tergion Technologies: AI-powered CRM, automation, and business systems for growing companies.

## Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- React Hook Form
- Zod
- Motion

## Local Setup

```bash
nvm use
npm install
npm run dev
```

Open `http://localhost:3000`.

## Commands

```bash
npm run dev
npm run build
npm run cf:build
npm run cf:preview
npm run cf:deploy
npm run cf:deploy-only
npm run lint
npm run typecheck
npm run start
```

## Environment

Copy `.env.example` to a local `.env.local` when credentials are available. Do not commit real secrets. Only `NEXT_PUBLIC_*` values are safe for client-side exposure.

## Phase 1A Scope

This pass includes the public site foundation, legal draft pages, examples scaffold, a 3-step lead form, `/api/leads`, `/api/health`, SEO basics, security headers, and provider stubs.

## Integration Status

Cloudflare Turnstile, Google Sheets, email sending, analytics, GoHighLevel, production rate limiting, and duplicate persistence are stubbed or deferred until credentials and provider choices are finalized.

## Security And Legal Notes

Lead capture submits to a server-side route. Secrets must stay server-side. Legal pages are draft templates and require attorney review before public launch.

## License

This project is proprietary and all rights are reserved. No license is granted
for reuse, redistribution, modification, or derivative works without written
permission from Tergion Technologies.

## Deployment

The project is configured for Cloudflare Workers with the OpenNext Cloudflare adapter. Runtime configuration is tracked in `wrangler.jsonc`, and deployment commands are in `package.json`.

Cloudflare production defaults:

- Worker name: `tergion`
- Custom domain: `https://tergion.com`
- Secondary domain: `https://www.tergion.com`
- Node.js: `22.16.0` or newer
- Build output: `.open-next`
- Local deploy command: `npm run cf:deploy`
- Workers Builds deploy command: `npm run cf:deploy-only`

Before live lead capture, configure production environment variables and secrets in Cloudflare, then verify `/api/health` and the lead form in the deployed Worker.

See `docs/cloudflare-deployment.md` for the deployment checklist.
