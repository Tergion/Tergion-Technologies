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
npm install
npm run dev
```

Open `http://localhost:3000`.

## Commands

```bash
npm run dev
npm run build
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

## Deployment

The project is Vercel-compatible. Configure production environment variables before enabling live lead capture integrations.
