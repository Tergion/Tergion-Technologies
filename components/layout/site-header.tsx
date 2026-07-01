import Link from "next/link";

import { LeadFormModal } from "@/components/forms/lead-form-modal";
import { siteConfig } from "@/lib/site-config";

export function SiteHeader() {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40 px-4 pt-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link
          href="/"
          className="pointer-events-auto glass-panel gradient-border flex h-12 shrink-0 items-center rounded-lg px-4 text-sm font-semibold tracking-tight text-foreground md:whitespace-nowrap xl:h-14"
          aria-label="Tergion Technologies home"
        >
          Tergion Technologies
        </Link>

        <nav
          aria-label="Primary"
          className="pointer-events-auto hidden items-center gap-1 rounded-lg border border-glass-border bg-glass px-2 py-2 shadow-xl shadow-black/15 supports-[backdrop-filter]:backdrop-blur-lg xl:flex"
        >
          {siteConfig.navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-white/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {link.label}
            </Link>
          ))}
          <LeadFormModal
            className="ml-2 h-10 px-4"
            label={siteConfig.cta.primary}
          />
        </nav>
      </div>
    </header>
  );
}
