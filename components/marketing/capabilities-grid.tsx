import { Bot, ChartSpline, DatabaseZap, Workflow } from "lucide-react";

import { GlassCard } from "@/components/marketing/glass-card";

const capabilities = [
  {
    title: "CRM Setup & Implementation",
    description:
      "Pipelines, contacts, calendars, follow-up stages, lead tracking, and customer communication systems.",
    icon: DatabaseZap,
  },
  {
    title: "Workflow Automation",
    description:
      "Follow-up, reminders, lead nurturing, and task routing built around clear timing and ownership.",
    icon: Workflow,
  },
  {
    title: "AI-Enabled Operations",
    description:
      "AI-assisted lead qualification, customer message drafting, internal task routing, and workflow planning with human review.",
    icon: Bot,
  },
  {
    title: "Business Growth Systems",
    description:
      "Forms, CRM workflows, reporting, and visibility across the customer pipeline.",
    icon: ChartSpline,
  },
];

export function CapabilitiesGrid() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {capabilities.map((capability) => {
        const Icon = capability.icon;

        return (
          <GlassCard
            key={capability.title}
            className="p-5 transition duration-200 hover:-translate-y-1 hover:border-primary/30 md:p-6"
          >
            <div className="flex size-11 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-primary">
              <Icon className="size-5" aria-hidden="true" />
            </div>
            <h3 className="mt-5 text-lg font-semibold text-foreground">
              {capability.title}
            </h3>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {capability.description}
            </p>
          </GlassCard>
        );
      })}
    </div>
  );
}
