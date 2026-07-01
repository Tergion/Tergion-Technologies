export const securityHeaders = [
  "X-Content-Type-Options",
  "X-Frame-Options",
  "Referrer-Policy",
  "Permissions-Policy",
  "Strict-Transport-Security",
] as const;

export const cspStatus =
  "CSP is intentionally deferred until Turnstile, analytics, and provider domains are finalized.";
