import type { Metadata } from "next";

import { RequestModalTrigger } from "@/components/forms/request-modal-trigger";
import { GlassCard } from "@/components/marketing/glass-card";
import { MarketingPageHeader } from "@/components/marketing/marketing-page-header";
import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Start a request with Tergion Technologies for CRM implementation, automation, lead follow-up, and business systems work.",
};

export default function ContactPage() {
  return (
    <>
      <MarketingPageHeader
        eyebrow="Contact"
        title="Start a request without a heavy intake process."
        description="Share the basics when you are ready. Optional business context can help, but it is not required to start the conversation."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-[color:var(--field-border)] bg-[var(--field-bg-muted)] p-4">
            <h2 className="text-base font-semibold text-foreground">
              Quick Request
            </h2>
            <p className="mt-2 min-h-12 text-sm leading-6 text-muted-foreground">
              Share the basics and we&apos;ll follow up.
            </p>
            <RequestModalTrigger
              triggerSource="contact-quick-request"
              className="mt-4 min-h-11 w-full px-5"
            >
              {siteConfig.cta.contactPage}
            </RequestModalTrigger>
          </div>
          <div className="rounded-xl border border-[color:var(--island-active-border)] bg-[var(--island-active-bg)] p-4">
            <h2 className="text-base font-semibold text-foreground">
              Automation Assessment
            </h2>
            <p className="mt-2 min-h-12 text-sm leading-6 text-muted-foreground">
              Answer a few questions so we can identify likely automation
              opportunities.
            </p>
            <RequestModalTrigger
              mode="automation_assessment"
              triggerSource="contact-automation-assessment"
              variant="outline"
              className="mt-4 min-h-11 w-full border-[color:var(--island-active-border)] bg-[var(--field-bg)] px-5 text-foreground"
            >
              Take the free assessment
            </RequestModalTrigger>
          </div>
        </div>
        <a
          href={`mailto:${siteConfig.contactEmail}`}
          className={buttonVariants({
            variant: "ghost",
            className: "mt-3 h-11 px-2 text-foreground",
          })}
        >
          Or email {siteConfig.contactEmail}
        </a>
        <p className="mt-4 text-sm text-muted-foreground">
          No obligation. No pressure. Submitting a request does not confirm an
          appointment.
        </p>
      </MarketingPageHeader>

      <section className="py-12 md:py-16">
        <div className="site-container">
          <GlassCard className="solid-panel max-w-4xl p-6 md:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              What happens next
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
              A simple request, reviewed by a person.
            </h2>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              The form asks for basic contact details, preferred follow-up
              method, scheduling preference, and consent choices. Business
              context is optional if it helps explain the workflow.
            </p>
            <div className="mt-6 rounded-lg border border-[color:var(--field-border)] bg-[var(--field-bg-muted)] p-4">
              <h3 className="text-sm font-semibold text-foreground">
                After you submit
              </h3>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
                <li>
                  Your request is sent through the secure server-side lead route.
                </li>
                <li>
                  Tergion reviews the details and follows up using your selected
                  contact method.
                </li>
                <li>
                  Submitting a request does not confirm an appointment or create
                  an obligation.
                </li>
              </ul>
            </div>
            <div className="mt-6">
              <RequestModalTrigger
                triggerSource="contact-page-lower-quick-request"
                variant="outline"
                className="h-11 border-[color:var(--field-border)] bg-[var(--field-bg)] px-4 text-foreground"
              >
                {siteConfig.cta.footerRequest}
              </RequestModalTrigger>
            </div>
          </GlassCard>
        </div>
      </section>
    </>
  );
}
