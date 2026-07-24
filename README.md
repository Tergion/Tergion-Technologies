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
npm run test
npm run test:e2e
npm run typecheck
npm run start
```

## Environment

Copy `.env.example` to a local `.env.local` when credentials are available. Do not commit real secrets. Only `NEXT_PUBLIC_*` values are safe for client-side exposure.

## Current Site Scope

This site includes the public marketing foundation, implementation-aligned legal pages, examples scaffold, a 4-step Quick Request, an 8-step Business Automation Assessment, `/api/leads`, `/api/health`, SEO basics, security headers, and provider boundaries.

## Integration Status

GoHighLevel contact sync is implemented when a Private Integration token and location ID are configured. Production lead submission fails closed when GoHighLevel delivery is unconfigured or when Cloudflare Turnstile cannot be verified; localhost and automated tests retain safe missing-credential stubs. Production rate limiting and duplicate suppression use Upstash Redis when configured and fall back to in-memory development storage otherwise. Transactional customer confirmation email supports Resend and Postmark when the selected provider and matching provider token are configured. The fixed sender uses `notifications@tergion.com`, the reply-to identity uses `noreply@tergion.com`, and the message directs corrections to `contact@tergion.com`. Confirmation delivery failures do not overturn an otherwise accepted lead. Google Sheets, internal lead notification email, and analytics remain stubbed or deferred.

## Security And Legal Notes

Lead capture submits to a server-side route. Secrets must stay server-side. Public legal pages cover website use and lead-request interactions, not final client service contracts. Final legal entity details, mailing address decisions, marketing-email/SMS operations, dispute terms, provider lists, and codebase license decisions still require business and legal review before production reliance.

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
