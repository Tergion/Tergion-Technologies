import type { Metadata } from "next";

import { CapabilityGroup } from "@/components/marketing/capability-group";
import { GlassCard } from "@/components/marketing/glass-card";
import { MarketingPageHeader } from "@/components/marketing/marketing-page-header";
import { SectionShell } from "@/components/marketing/section-shell";
import { serviceCapabilityGroups } from "@/features/services/service-capabilities.data";

export const metadata: Metadata = {
  title: "Services",
  description:
    "CRM implementation, workflow automation, AI-enabled operations, and business systems from Tergion Technologies.",
};

const services = [
  {
    title: "CRM Setup & Implementation",
    description:
      "Configure contacts, pipelines, calendars, conversations, lead stages, and ownership rules so the team can manage follow-up from one organized system.",
  },
  {
    title: "Workflow Automation",
    description:
      "Build follow-up, reminder, assignment, and notification workflows with clear points where a person can review, pause, or adjust the system.",
  },
  {
    title: "Website and Funnel Form Workflows",
    description:
      "Route form submissions into structured CRM records with source details, assignment logic, and follow-up actions.",
  },
  {
    title: "Lead Capture & Follow-Up Systems",
    description:
      "Connect website forms, calls, calendars, and CRM records so new inquiries receive consistent next steps without relying on memory.",
  },
  {
    title: "Reporting and Visibility",
    description:
      "Organize lead, appointment, communication, and workflow data so owners can see what is active, stalled, or waiting for action.",
  },
  {
    title: "AI-Assisted Operations",
    description:
      "Use AI support for drafting, qualification notes, routing, and workflow planning while keeping business judgment and review in the loop.",
  },
];

export default function ServicesPage() {
  return (
    <>
      <MarketingPageHeader
        eyebrow="Services"
        title="Business systems and automation infrastructure for SMB operations."
        description="Tergion Technologies helps companies connect lead capture, follow-up, customer communication, CRM workflows, and operational visibility."
      />

      <section className="py-12 md:py-16">
        <div className="site-container grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {services.map((service) => (
            <GlassCard key={service.title} className="solid-panel p-6">
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

      <SectionShell
        eyebrow="Platform-enabled capabilities"
        title="Systems Tergion can configure without making the platform the whole identity."
        description="These are common capability areas Tergion can support when they fit the business process. The work starts with the operating need, then uses the right platform features to support it."
        className="pt-8 md:pt-12"
        tone="soft-blue"
      >
        <div className="grid gap-4 lg:grid-cols-2">
          {serviceCapabilityGroups.map((group, index) => (
            <CapabilityGroup
              key={group.title}
              group={group}
              opensUpOnDesktop={
                index >= serviceCapabilityGroups.length - 2
              }
            />
          ))}
        </div>
      </SectionShell>
    </>
  );
}
