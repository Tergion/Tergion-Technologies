import type { Metadata } from "next";
import Link from "next/link";

import { RequestModalTrigger } from "@/components/forms/request-modal-trigger";
import { GlassCard } from "@/components/marketing/glass-card";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Start a request with Tergion Technologies for CRM implementation, automation, lead follow-up, and business systems work.",
};

const expectations = [
  "Share the basic contact details and preferred follow-up method.",
  "Add business context only if it helps explain the workflow.",
  "Tergion will follow up based on the preferred contact method you choose.",
];

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
              Start the request
            </RequestModalTrigger>
            <a
              href={`mailto:${siteConfig.contactEmail}`}
              className="inline-flex h-12 items-center justify-center rounded-lg border border-[color:var(--field-border)] bg-[var(--field-bg)] px-5 text-sm font-medium text-foreground transition hover:bg-[var(--island-hover-bg)] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[var(--island-focus-ring)]"
            >
              {siteConfig.contactEmail}
            </a>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            No obligation. No pressure. Submitting a request does not confirm an
            appointment.
          </p>

          <GlassCard className="mt-8 p-6">
            <h2 className="text-lg font-semibold text-foreground">
              What happens next
            </h2>
            <ul className="mt-5 space-y-4 text-sm leading-6 text-muted-foreground">
              {expectations.map((item) => (
                <li key={item} className="border-l border-primary/40 pl-4">
                  {item}
                </li>
              ))}
            </ul>
          </GlassCard>

          <p className="mt-6 max-w-2xl text-sm leading-6 text-muted-foreground">
            Submitting this form does not confirm an appointment or create an
            obligation. Review the{" "}
            <Link href="/privacy" className="text-primary hover:text-foreground">
              Privacy
            </Link>{" "}
            and{" "}
            <Link href="/terms" className="text-primary hover:text-foreground">
              Terms
            </Link>{" "}
            pages for draft site policies.
          </p>
        </div>

        <GlassCard className="p-6 md:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Request path
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
            The form opens as a site-wide modal.
          </h2>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            You can start from this page, the homepage, services, examples, or
            the footer. The request goes through the same secure server-side
            lead route either way.
          </p>
          <div className="mt-6 rounded-lg border border-[color:var(--field-border)] bg-[var(--field-bg-muted)] p-4">
            <h3 className="text-sm font-semibold text-foreground">
              What the request asks for
            </h3>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
              <li>Basic contact details and scheduling preference.</li>
              <li>Optional CRM, priority, and workflow context.</li>
              <li>Consent choices before anything is submitted.</li>
            </ul>
          </div>
          <div className="mt-6">
            <RequestModalTrigger className="h-11 px-4">
              Request a free automation review
            </RequestModalTrigger>
          </div>
        </GlassCard>
      </div>
    </section>
  );
}
