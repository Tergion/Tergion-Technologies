import type { Metadata } from "next";

import { CTASection } from "@/components/marketing/cta-section";
import { GlassCard } from "@/components/marketing/glass-card";

export const metadata: Metadata = {
  title: "Services",
  description:
    "CRM implementation, workflow automation, AI-enabled operations, and business systems from Tergion Technologies.",
};

const services = [
  {
    title: "CRM Setup & Implementation",
    description:
      "Configure contacts, pipelines, calendars, conversations, lead stages, and ownership rules so the team has one operational source of truth.",
  },
  {
    title: "Workflow Automation",
    description:
      "Build follow-up, reminder, assignment, and notification workflows with clear points where a person can review, pause, or adjust the system.",
  },
  {
    title: "AI-Assisted Operations",
    description:
      "Use AI support for drafting, qualification notes, routing, and workflow planning while keeping business judgment and review in the loop.",
  },
  {
    title: "Lead Capture & Follow-Up Systems",
    description:
      "Connect website forms, calls, calendars, and CRM records so new inquiries receive consistent next steps without relying on memory.",
  },
  {
    title: "Review Request Workflows",
    description:
      "Create controlled customer feedback workflows that help teams request reviews at appropriate times without fake or pressured reviews.",
  },
  {
    title: "Website and Funnel Form Workflows",
    description:
      "Route form submissions into structured CRM records with source details, assignment logic, and follow-up actions.",
  },
  {
    title: "Reporting and Visibility",
    description:
      "Organize lead, appointment, communication, and workflow data so owners can see what is active, stalled, or waiting for action.",
  },
  {
    title: "White-Label CRM Access",
    description:
      "Tergion can configure white-label CRM access for businesses that need a centralized place to manage leads, appointments, conversations, automations, and follow-up.",
  },
];

export default function ServicesPage() {
  return (
    <>
      <section className="px-6 pb-8 pt-28 md:pt-36">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Services
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight text-foreground md:text-6xl">
            Business systems and automation infrastructure for SMB operations.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-muted-foreground">
            Tergion Technologies helps companies connect lead capture,
            follow-up, customer communication, CRM workflows, and operational
            visibility.
          </p>
        </div>
      </section>

      <section className="px-6 py-12 md:py-16">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-2 xl:grid-cols-4">
          {services.map((service) => (
            <GlassCard key={service.title} className="p-6">
              <h2 className="text-lg font-semibold text-foreground">
                {service.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {service.description}
              </p>
            </GlassCard>
          ))}
        </div>
      </section>

      <CTASection />
    </>
  );
}
