# Engineering Standards

## Architecture

- Use Next.js App Router conventions.
- Prefer server components by default.
- Use client components only for required interactivity.
- Keep feature logic grouped by domain.
- Keep lead capture logic under the lead feature boundary.
- Keep layout, marketing, form, and UI components separated.
- Keep reusable configuration and environment helpers centralized under `lib`.
- Avoid adding a backend, database, authentication, payments, or portal behavior without explicit approval.

## Server-Side Lead Handling

- Lead capture must submit to a server-side route or action.
- Keep validation, spam checks, rate limits, duplicate checks, provider calls, and provider stubs server-side.
- Return generic user-facing errors from lead endpoints.
- Keep provider details and provider failures out of client responses.
- Do not expose private keys, service account credentials, email tokens, CRM credentials, or bot-protection secrets in public variables.

## UI And Design

- Use reusable UI primitives and local design-system patterns.
- Keep the liquid glass style restrained, readable, and credible.
- Preserve clear spacing, hierarchy, focus states, and responsive behavior.
- Avoid design-system drift and unnecessary one-off styles.
- Avoid generic low-quality agency language or generic AI-product visual patterns.
- Keep GoHighLevel framed as one possible implementation tool, not the company identity.

## Content And Legal

- Use serious B2B systems language.
- Do not add fake testimonials, fake reviews, fake statistics, or unsupported outcome claims.
- Do not claim guaranteed revenue growth, guaranteed lead growth, guaranteed AI accuracy, or guaranteed compliance.
- Legal pages are draft content and require qualified review before public launch.

## Dependencies

- Add dependencies only when they reduce real complexity or are required for an approved feature.
- Avoid heavy animation, background video, particle, analytics, chatbot, or dashboard dependencies without explicit approval.
- Prefer the existing stack and local patterns before introducing a new abstraction.
