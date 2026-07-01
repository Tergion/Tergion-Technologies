export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only z-[60] rounded-md bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
    >
      Skip to content
    </a>
  );
}
