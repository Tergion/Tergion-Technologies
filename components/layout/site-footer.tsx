import Link from "next/link";

import { RequestModalTrigger } from "@/components/forms/request-modal-trigger";
import { siteConfig } from "@/lib/site-config";

const capabilityLinks = [
  "CRM & Contacts",
  "Workflows",
  "Communication",
  "Scheduling",
  "Reporting",
  "AI-assisted operations",
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface-muted pb-28 pt-14 xl:pb-10">
      <div className="site-container">
        <div className="grid gap-8 border-b border-border pb-10 lg:grid-cols-[1.15fr_2fr]">
          <div>
            <Link
              href="/"
              className="text-base font-semibold tracking-tight text-foreground"
            >
              {siteConfig.name}
            </Link>
            <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">
              Business systems, CRM implementation, workflow automation, and
              AI-assisted operations for growing companies.
            </p>
            <div className="mt-6">
              <RequestModalTrigger className="h-10 px-4">
                Start the request
              </RequestModalTrigger>
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
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
              </ul>
            </div>

            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Capabilities
              </h2>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                {capabilityLinks.map((capability) => (
                  <li key={capability}>
                    <Link className="hover:text-foreground" href="/services">
                      {capability}
                    </Link>
                  </li>
                ))}
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

            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Contact / Access
              </h2>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                <li>
                  <a
                    className="hover:text-foreground"
                    href={`mailto:${siteConfig.contactEmail}`}
                  >
                    {siteConfig.contactEmail}
                  </a>
                </li>
                {siteConfig.ghlLoginUrl ? (
                  <li>
                    <a
                      className="hover:text-foreground"
                      href={siteConfig.ghlLoginUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Client login
                    </a>
                  </li>
                ) : null}
                <li>
                  <RequestModalTrigger variant="link" className="h-auto p-0">
                    Request review
                  </RequestModalTrigger>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-6 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>&copy; 2026 Tergion Technologies. All rights reserved.</p>
          <p>Built for business systems, automation, and CRM operations.</p>
        </div>
      </div>
    </footer>
  );
}
