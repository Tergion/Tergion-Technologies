import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/lib/site-config";

export function SiteHeader() {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40 pt-4">
      <div className="site-container flex min-w-0 items-center justify-between gap-4">
        <Link
          href="/"
          className="pointer-events-auto glass-panel gradient-border flex h-12 max-w-full shrink-0 items-center whitespace-nowrap rounded-lg px-4 text-sm font-semibold tracking-tight text-foreground xl:h-14"
          aria-label="Tergion Technologies home"
        >
          Tergion Technologies
        </Link>

        <nav
          aria-label="Primary"
          className="pointer-events-auto hidden items-center gap-1 rounded-lg border border-glass-border bg-glass px-2 py-2 shadow-xl shadow-accent-strong/10 supports-[backdrop-filter]:backdrop-blur-lg xl:flex"
        >
          {siteConfig.navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-2.5 py-2 text-sm font-medium text-muted-foreground transition hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/contact"
            className={buttonVariants({
              className: "ml-2 h-10 px-4",
            })}
          >
            {siteConfig.cta.start}
          </Link>
        </nav>
      </div>
    </header>
  );
}
