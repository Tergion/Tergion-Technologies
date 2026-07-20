import Image from "next/image";
import Link from "next/link";

import { RequestModalTrigger } from "@/components/forms/request-modal-trigger";
import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

const capabilityLinks = [
  "CRM & Contacts",
  "Workflows",
  "Communication",
  "Scheduling",
  "Reporting",
  "AI-assisted operations",
];

const footerTextInteractionClass =
  "rounded-sm underline-offset-4 transition-[color,text-shadow,text-decoration-color] duration-200 hover:text-white hover:underline hover:decoration-white hover:[text-shadow:0_0_12px_rgba(5,76,179,0.95),0_2px_8px_rgba(0,0,0,0.42)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/[0.92] focus-visible:underline focus-visible:[text-shadow:0_0_12px_rgba(5,76,179,0.95),0_2px_8px_rgba(0,0,0,0.42)]";

const footerLinkClass = cn(
  "text-white/[0.74]",
  footerTextInteractionClass,
);

export function SiteFooter() {
  return (
    <footer className="border-t border-[rgba(255,255,255,0.14)] bg-deep-panel pb-28 pt-14 text-white xl:pb-10">
      <div className="site-container">
        <div className="grid gap-8 border-b border-[rgba(255,255,255,0.14)] pb-10 xl:grid-cols-[1.15fr_2fr]">
          <div data-footer-brand-block>
            <div className="grid gap-5 sm:grid-cols-[auto_1px_minmax(0,1fr)] sm:items-stretch sm:gap-6">
              <Link
                href="/"
                className="inline-flex self-start rounded-sm transition-opacity duration-200 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/[0.92] sm:self-center"
              >
                <Image
                  src="/logos/tergion_logo_white_text.png"
                  alt="Tergion Technologies"
                  width={653}
                  height={505}
                  sizes="(min-width: 640px) 206px, 190px"
                  className="h-auto w-[11.875rem] sm:w-[12.875rem]"
                />
              </Link>

              <span
                aria-hidden="true"
                data-footer-brand-divider
                className="h-px w-full bg-white/30 sm:h-full sm:min-h-32 sm:w-px sm:self-stretch"
              />

              <div className="min-w-0 sm:self-center">
                <p className="max-w-md text-sm leading-6 text-white/[0.74]">
                  Business systems, CRM implementation, workflow automation,
                  and AI-assisted operations for growing companies.
                </p>
                <div className="mt-6">
                  <Link
                    href="/contact"
                    className={buttonVariants({
                      variant: "outline",
                      className:
                        "h-10 border-white/80 bg-white px-4 text-deep-panel shadow-[0_2px_5px_rgba(0,0,0,0.22)] transition-[color,background-color,border-color,box-shadow,transform] duration-200 hover:border-[#cbd5e1]! hover:bg-[#f8fafc]! hover:text-deep-panel! hover:shadow-[0_6px_14px_rgba(0,0,0,0.28),0_1px_3px_rgba(0,0,0,0.24)] hover:[transform:translateY(-1px)] focus-visible:border-[#cbd5e1]! focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--deep-panel)] focus-visible:shadow-[0_4px_10px_rgba(0,0,0,0.26)] motion-reduce:hover:[transform:none]",
                    })}
                  >
                    {siteConfig.cta.footer}
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
            <div>
              <h2 className="text-sm font-semibold text-white">Company</h2>
              <ul className="mt-4 space-y-3 text-sm">
                {siteConfig.navLinks.map((link) => (
                  <li key={link.href}>
                    <Link className={footerLinkClass} href={link.href}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-sm font-semibold text-white">
                Capabilities
              </h2>
              <ul className="mt-4 space-y-3 text-sm">
                {capabilityLinks.map((capability) => (
                  <li key={capability}>
                    <Link className={footerLinkClass} href="/services">
                      {capability}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-sm font-semibold text-white">Legal</h2>
              <ul className="mt-4 space-y-3 text-sm">
                {siteConfig.legalLinks.map((link) => (
                  <li key={link.href}>
                    <Link className={footerLinkClass} href={link.href}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-sm font-semibold text-white">
                Contact
              </h2>
              <ul className="mt-4 space-y-3 text-sm">
                <li>
                  <a
                    className={footerLinkClass}
                    href={`mailto:${siteConfig.contactEmail}`}
                  >
                    {siteConfig.contactEmail}
                  </a>
                </li>
                {siteConfig.ghlLoginUrl ? (
                  <li>
                    <a
                      className={footerLinkClass}
                      href={siteConfig.ghlLoginUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Client login
                    </a>
                  </li>
                ) : null}
                <li>
                  <RequestModalTrigger
                    variant="link"
                    className={cn(
                      "h-auto p-0 text-white hover:text-white",
                      footerTextInteractionClass,
                    )}
                  >
                    {siteConfig.cta.footerRequest}
                  </RequestModalTrigger>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-6 text-sm text-white/[0.74] md:flex-row md:items-center md:justify-between">
          <p>&copy; 2026 Tergion Technologies. All rights reserved.</p>
          <p>Built for business systems, automation, and CRM operations.</p>
        </div>
      </div>
    </footer>
  );
}
