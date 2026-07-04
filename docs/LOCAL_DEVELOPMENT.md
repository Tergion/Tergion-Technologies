# Local Development

## Prerequisites

- Node.js `22.16.0` or newer.
- npm `10.9.2` or newer.
- Package installs should use npm because this project has `package-lock.json`.
- Use `.nvmrc` when your Node version manager supports it.

## Install

```bash
npm ci
```

Use `npm install` only when intentionally updating dependencies or the lockfile.

## Development Server

```bash
npm run dev
```

The default development port is `3000`. If ports `3000` or `3001` are occupied, use another available port:

```bash
npm run dev -- --port 3002
```

The smart local helper can pick a port from `3000` through `3010`:

```bash
npm run dev:smart
```

## Verification

```bash
npm run lint
npm run typecheck
npm run build
```

The local verification helper runs the same checks and runs tests if a test script is later added:

```bash
npm run verify:local
```

Cloudflare Worker build and preview:

```bash
npm run cf:build
npm run cf:preview
```

`cf:preview` builds the OpenNext Worker output and runs it through Wrangler so API routes and Cloudflare runtime behavior can be checked before deployment.

## Environment Variables

- Use `.env.local` for local values.
- Copy `.dev.vars.example` to `.dev.vars` when using Wrangler preview.
- Do not commit real credentials.
- `.env.example` documents expected variables with placeholders only.
- Missing integration credentials should keep local development usable through safe stubs.

## Stubbed Integrations

The current site still uses stubs or deferred implementations for Google Sheets append, transactional email, live bot-protection widget loading, production distributed rate limiting, persistent duplicate detection, analytics, and future CRM integration.

## API Checks

Health endpoint:

```bash
Invoke-WebRequest -UseBasicParsing -Uri "http://localhost:3000/api/health"
```

Lead endpoint with dummy data:

```bash
$payload = @{
  firstName = "Test"
  businessName = "Example Business"
  email = "test@example.com"
  preferredContactMethod = "email"
  schedulingPreference = "Weekdays after 5 PM"
  contactConsent = $true
  privacyTermsConsent = $true
  completionStartedAt = ([DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds() - 10000)
  aiDisclosureSeen = $true
} | ConvertTo-Json -Depth 5

Invoke-WebRequest -UseBasicParsing -Method Post -Uri "http://localhost:3000/api/leads" -ContentType "application/json" -Body $payload
```

## Cleaning Local Artifacts

```bash
npm run clean:local
```

By default the clean helper removes `.next` only. It must not remove environment files, source files, docs, or public assets.
