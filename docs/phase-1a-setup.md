# Phase 1A Setup

## What Was Built

- Next.js App Router foundation with TypeScript, Tailwind CSS v4, ESLint, shadcn/ui, and npm.
- Dark liquid-glass marketing shell with desktop header, mobile action bar, footer, SEO metadata, robots, sitemap, and security headers.
- Routes for home, services, about, examples, example detail pages, legal draft pages, `/api/health`, and `/api/leads`.
- A 3-step lead form with server-side validation and safe provider stubs.

## Folder Structure

- `app/`: routes, metadata, API handlers, sitemap, robots, global CSS.
- `components/`: UI primitives, layout components, marketing sections, and form components.
- `features/`: lead schemas/integrations, example data, and legal content.
- `lib/`: site config, metadata helpers, env helpers, analytics placeholder, and security notes.
- `docs/`: setup, roadmap, env, security, legal, and content guidance.

## Architecture Decisions

- Lead capture uses `/api/leads` so private provider keys never enter client code.
- Marketing pages stay mostly static and server-rendered.
- Client components are limited to the form modal, form steps, and restrained motion.
- External provider integrations return safe development stubs until credentials and production behavior are approved.

## Local Run

```bash
npm install
npm run dev
```

## Lead Flow Test

Open the site, click `Request a free automation review`, complete required contact fields, skip optional context if desired, accept contact and privacy/terms consent, then submit.

With no credentials configured, the API validates the request and returns success while Sheets and email modules report stubbed behavior internally.

## Phase 1B Remains

- Wire real Google Sheets append or replace it with a durable CRM/database target.
- Enable real internal and confirmation email sending.
- Add production-grade distributed rate limiting.
- Add live Turnstile widget script and token handoff.
- Complete legal review and provider/subprocessor details.
- Add analytics only after privacy/legal review.
