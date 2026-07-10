import type { Metadata } from "next";
import Link from "next/link";

import { RequestModalTrigger } from "@/components/forms/request-modal-trigger";
import { GlassCard } from "@/components/marketing/glass-card";
import { ProcessSteps } from "@/components/marketing/process-steps";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Process",
  description:
    "How Tergion Technologies reviews business workflows, maps automation plans, builds systems, and keeps control points clear.",
};

const controlPoints = [
  {
    title: "Human review where it matters",
    description:
      "Workflows can include approval steps, manual handoffs, and pause points instead of forcing every decision through automation.",
  },
  {
    title: "Clear ownership",
    description:
      "Leads, appointments, conversations, and tasks should have visible ownership so the team knows what needs action.",
  },
  {
    title: "Practical rollout",
    description:
      "The system is launched in a way the business can understand, monitor, and adjust as real work moves through it.",
  },
];

const outputs = [
  "A mapped view of the current sales or customer workflow.",
  "A clear automation plan showing triggers, actions, and review points.",
  "Configured CRM structure, forms, calendars, notifications, and follow-up logic where appropriate.",
  "A launch path that keeps business-owner control and avoids unsupported outcome claims.",
];

export default function ProcessPage() {
  return (
    <>
      <section className="pb-8 pt-28 md:pt-36">
        <div className="site-container">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Process
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight text-foreground md:text-6xl">
            A practical build process with control built in.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-muted-foreground">
            Tergion reviews how work moves today, maps what should be
            automated, builds the system, and keeps review points visible so the
            business stays in control.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <RequestModalTrigger
              variant="outline"
              className="h-12 border-[color:var(--field-border)] bg-[var(--field-bg)] px-5 text-foreground hover:bg-[var(--island-hover-bg)]"
            >
              Talk through options
            </RequestModalTrigger>
            <Link
              href="/examples"
              className={buttonVariants({
                variant: "outline",
                className:
                  "h-12 border-[color:var(--field-border)] bg-[var(--field-bg)] px-5 text-foreground hover:bg-[var(--island-hover-bg)]",
              })}
            >
              See examples
            </Link>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="site-container">
          <ProcessSteps />
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="site-container grid gap-4 md:grid-cols-3">
          {controlPoints.map((point) => (
            <GlassCard key={point.title} className="p-6">
              <h2 className="text-lg font-semibold text-foreground">
                {point.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {point.description}
              </p>
            </GlassCard>
          ))}
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="site-container grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Outputs
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
              The process produces a system the business can understand.
            </h2>
            <p className="mt-5 text-base leading-7 text-muted-foreground">
              The goal is not automation for its own sake. The goal is a
              clearer operating system for leads, customers, follow-up, and
              internal visibility.
            </p>
          </div>

          <GlassCard className="p-6 md:p-8">
            <ul className="space-y-4 text-sm leading-6 text-muted-foreground">
              {outputs.map((output) => (
                <li
                  key={output}
                  className="rounded-lg border border-[color:var(--field-border)] bg-[var(--field-bg-muted)] p-4"
                >
                  {output}
                </li>
              ))}
            </ul>
          </GlassCard>
        </div>
      </section>
    </>
  );
}
