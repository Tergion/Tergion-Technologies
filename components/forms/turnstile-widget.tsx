export function TurnstileWidget() {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";

  if (!siteKey) {
    return (
      <p className="text-xs leading-5 text-muted-foreground">
        Spam protection will run automatically when this site is configured for
        production.
      </p>
    );
  }

  return (
    <div
      className="rounded-md border border-white/10 bg-white/[0.035] p-3 text-xs text-muted-foreground"
      data-sitekey={siteKey}
  >
      Spam protection will run automatically before this request is accepted.
    </div>
  );
}
