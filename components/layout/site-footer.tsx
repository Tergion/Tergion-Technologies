import Link from "next/link";

import { LeadFormModal } from "@/components/forms/lead-form-modal";
import { siteConfig } from "@/lib/site-config";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 px-6 pb-10 pt-14">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1.2fr_1fr]">
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
            <LeadFormModal label="Request a free automation review" />
          </div>
        </div>

        <div className="grid gap-8 sm:grid-cols-2">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Company</h2>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              {siteConfig.navLinks.slice(0, 3).map((link) => (
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
