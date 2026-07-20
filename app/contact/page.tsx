import type { Metadata } from "next";

import { RequestModalTrigger } from "@/components/forms/request-modal-trigger";
import { GlassCard } from "@/components/marketing/glass-card";
import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Start a request with Tergion Technologies for CRM implementation, automation, lead follow-up, and business systems work.",
};

export default function ContactPage() {
  return (
    <section className="pb-16 pt-28 md:pb-24 md:pt-36">
      <div className="site-container grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent-strong">
            Contact
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-foreground md:text-6xl">
            Start a request without a heavy intake process.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            Share the basics when you are ready. Optional business context can
            help, but it is not required to start the conversation.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <RequestModalTrigger className="h-12 px-5">
              {siteConfig.cta.contactPage}
            </RequestModalTrigger>
            <a
              href={`mailto:${siteConfig.contactEmail}`}
              className={buttonVariants({
                variant: "outline",
                className:
                  "h-12 border-[color:var(--field-border)] bg-[var(--field-bg)] px-5 text-foreground",
              })}
            >
              {siteConfig.contactEmail}
            </a>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            No obligation. No pressure. Submitting a request does not confirm an
            appointment.
          </p>
        </div>

        <GlassCard className="p-6 md:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            What happens next
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
            A simple request, reviewed by a person.
          </h2>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            The form asks for basic contact details, preferred follow-up method,
            scheduling preference, and consent choices. Business context is
            optional if it helps explain the workflow.
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
                variant="outline"
                className="h-11 border-[color:var(--field-border)] bg-[var(--field-bg)] px-4 text-foreground"
            >
              {siteConfig.cta.footerRequest}
            </RequestModalTrigger>
          </div>
        </GlassCard>
      </div>
    </section>
  );
}
