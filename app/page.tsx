import { RequestModalTrigger } from "@/components/forms/request-modal-trigger";
import { Hero } from "@/components/marketing/hero";
import { SectionShell } from "@/components/marketing/section-shell";
import { WorkflowShowcase } from "@/components/marketing/workflow-showcase";
import { workflows } from "@/features/workflows/workflows.data";

const focusAreas = [
  {
    title: "Business systems",
    description:
      "Organize the tools, handoffs, and visibility a growing business needs to manage work consistently.",
  },
  {
    title: "CRM implementation",
    description:
      "Set up contacts, pipelines, calendars, conversations, and ownership rules around the way the business operates.",
  },
  {
    title: "Workflow automation",
    description:
      "Reduce repetitive follow-up and reminders while keeping review points and manual control where they matter.",
  },
  {
    title: "Lead follow-up",
    description:
      "Connect forms, calls, calendars, and communication steps so new inquiries do not depend on memory.",
  },
  {
    title: "AI-assisted operations",
    description:
      "Use AI support for drafting, routing, notes, and workflow planning without removing business judgment.",
  },
];

export default function Home() {
  return (
    <>
      <Hero />

      <SectionShell
        eyebrow="What Tergion does"
        title="Practical systems for sales, customer communication, and operations."
        description="Tergion Technologies helps growing companies capture leads, follow up faster, automate repetitive work, and keep control of the process."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {focusAreas.map((area) => (
            <div
              key={area.title}
              className="rounded-lg border border-border border-t-[3px] border-t-primary bg-white p-5 shadow-[0_14px_35px_rgba(19,42,70,0.08)]"
            >
              <h2 className="text-base font-semibold text-foreground">
                {area.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {area.description}
              </p>
            </div>
          ))}
        </div>
      </SectionShell>

      <SectionShell
        eyebrow="WORKFLOW EXAMPLES"
        title="Choose a workflow. See how the system works."
        description="Every business has a few steps where leads, follow-ups, or customer communication fall through the cracks. These examples show how Tergion turns those steps into trackable systems with clear control points."
        tone="soft-blue"
      >
        <WorkflowShowcase workflows={workflows} />
        <div className="mt-8 flex flex-col items-start gap-3 rounded-xl border border-border bg-white/80 p-5 shadow-[0_14px_35px_rgba(19,42,70,0.08)] sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Want a closer look at your own process?
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Answer a few questions so we can identify likely automation
              opportunities.
            </p>
          </div>
          <RequestModalTrigger
            mode="automation_assessment"
            triggerSource="homepage-workflow-assessment"
            className="min-h-11 shrink-0 px-5"
          >
            Take the free assessment
          </RequestModalTrigger>
        </div>
      </SectionShell>
    </>
  );
}
