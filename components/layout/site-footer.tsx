import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/lib/site-config";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface pb-10 pt-14">
      <div className="site-container grid gap-10 md:grid-cols-[1.2fr_1fr]">
        <div>
          <Link
            href="/"
            className="text-base font-semibold tracking-tight text-foreground"
          >
            {siteConfig.name}
          </Link>
          <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">
            AI-powered CRM, automation, and business systems for growing
            companies. Automation should make a business easier to manage, not
            harder to control.
          </p>
          <div className="mt-6">
            <Link
              href="/contact"
              className={buttonVariants({ className: "h-10 px-4" })}
            >
              Request a free automation review
            </Link>
          </div>
        </div>

        <div className="grid gap-8 sm:grid-cols-2">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Company</h2>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              {siteConfig.navLinks.map((link) => (
                <li key={link.href}>
                  <Link className="hover:text-foreground" href={link.href}>
                    {link.label}
                  </Link>
                </li>
              ))}
              {siteConfig.ghlLoginUrl ? (
                <li>
                  <Link
                    className="hover:text-foreground"
                    href={siteConfig.ghlLoginUrl}
                  >
                    Client login
                  </Link>
                </li>
              ) : null}
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-foreground">Legal</h2>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              {siteConfig.legalLinks.map((link) => (
                <li key={link.href}>
                  <Link className="hover:text-foreground" href={link.href}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
