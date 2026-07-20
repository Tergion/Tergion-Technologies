"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { RequestModalTrigger } from "@/components/forms/request-modal-trigger";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40 pt-4">
      <div className="site-container flex min-w-0 items-center justify-between gap-4">
        <Link
          href="/"
          className="pointer-events-auto island-panel flex h-12 max-w-full shrink-0 items-center whitespace-nowrap rounded-lg px-4 text-sm font-semibold tracking-tight text-foreground xl:h-14"
          aria-label="Tergion Technologies home"
        >
          Tergion Technologies
        </Link>

        <nav
          aria-label="Primary"
          className="pointer-events-auto island-panel hidden items-center gap-1 rounded-lg px-2 py-2 xl:flex"
        >
          {siteConfig.navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname === link.href ||
                  pathname.startsWith(`${link.href}/`);

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "rounded-md border px-2.5 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[var(--island-focus-ring)]",
                  isActive
                    ? "border-[color:var(--island-active-border)] bg-[var(--island-active-bg)] text-foreground"
                    : "border-transparent text-muted-foreground hover:bg-[var(--island-hover-bg)] hover:text-foreground",
                )}
              >
                {link.label}
              </Link>
            );
          })}
          <RequestModalTrigger
            className="ml-2 h-9 px-3 text-sm shadow-none hover:[transform:none] hover:shadow-none"
          >
            {siteConfig.cta.nav}
          </RequestModalTrigger>
        </nav>
      </div>
    </header>
  );
}
