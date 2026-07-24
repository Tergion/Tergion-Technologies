# Security Checklist

## Secrets And Configuration

- Do not commit secrets.
- Keep `.env` files local.
- Keep `.env.example` limited to placeholders and public documentation.
- Use public variables only for values that are safe to expose in the browser.
- Keep service account credentials, email provider credentials, CRM credentials, and bot-protection secrets server-side.
- Do not run broad dependency upgrade or audit repair commands without explicit approval.

## Lead Intake

- Lead submissions must go through `/api/leads`.
- Validate all submitted fields server-side.
- Validate and normalize email.
- Require phone only when the preferred contact method is phone or text.
- Enforce input length limits.
- Check honeypot fields.
- Check minimum completion timing.
- Use rate limiting.
- Use stable per-form-session submission IDs for provider idempotency.
- Keep same-form identity cooldowns separate from shared client rate limits.
- Hash normalized email, phone, and client signals before using them in Redis keys.
- Reserve atomically before provider writes, commit only after durable CRM
  persistence, and release identity reservations after definite failures.
- Verify bot-protection tokens server-side when configured.
- Do not rely only on a bot-protection widget.
- Resolve email and phone independently before Contact writes.
- Fail closed when identifiers resolve to different Contacts or multiple
  Contacts, and never expose match existence in the public response.
- Never replace a different nonempty Contact email or phone from a public form.
- Never clear Contact fields because a submitted optional value is blank.

## API Responses And Logging

- Return generic user-facing errors.
- Do not return stack traces.
- Do not leak provider errors to users.
- Log safely and avoid unnecessary sensitive payload logging.
- Mask identity diagnostics and omit provider Contact data and response bodies.
- Do not store full IP addresses unless explicitly justified and documented.
- Do not render user-submitted content as HTML.

## External Services

- Keep Google Sheets credentials server-side.
- Keep transactional email credentials server-side.
- Keep future CRM credentials server-side.
- Review provider retry, failure, and data-retention behavior before production use.

## Browser And Headers

- Keep baseline security headers configured.
- External links opening a new tab must use `rel="noopener noreferrer"`.
- Add a production content security policy only after required provider domains are known.
- Review analytics, chat, and embedded third-party scripts before adding them.
