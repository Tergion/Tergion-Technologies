import type { Metadata } from "next";
import Link from "next/link";

import { LeadForm } from "@/components/forms/lead-form";
import { GlassCard } from "@/components/marketing/glass-card";

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
      <div className="site-container grid gap-8 xl:grid-cols-[0.82fr_1.18fr] xl:items-start">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Contact
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-foreground md:text-6xl">
            Start with the basics. The system details can come later.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            Use this form to request a focused automation review. It is built to
            keep the first step light: contact details, scheduling preference,
            and any optional business context you want to include.
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

        <GlassCard className="p-5 md:p-6">
          <div className="mb-6 border-b border-white/10 pb-5">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Request form
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
              Request a free automation review
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Required fields are limited to basic contact and scheduling
              details. Business context remains optional.
            </p>
          </div>
          <LeadForm />
        </GlassCard>
      </div>
    </section>
  );
}
