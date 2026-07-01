import { ArrowDown, CheckCircle2, CircleDot } from "lucide-react";

import { GlassCard } from "@/components/marketing/glass-card";
import { cn } from "@/lib/utils";

const workflowSteps = [
  {
    title: "New website lead received",
    note: "Capture the request with source and context.",
  },
  {
    title: "Contact added to CRM",
    note: "Keep the record visible to the team.",
  },
  {
    title: "AI-assisted qualification note created",
    note: "Summarize context for human review.",
  },
  {
    title: "Follow-up email or SMS queued",
    note: "Use approved timing and message rules.",
  },
  {
    title: "Task assigned to team",
    note: "Give ownership to the right person.",
  },
  {
    title: "Review or appointment reminder scheduled",
    note: "Keep next steps from falling through.",
  },
];

export function WorkflowMockup({ compact = false }: { compact?: boolean }) {
  return (
    <GlassCard className={cn("min-w-0 p-5", compact ? "lg:p-6" : "p-6 md:p-8")}>
      <div className="flex min-w-0 items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Example workflow preview
          </p>
          <h3 className="mt-2 text-lg font-semibold text-foreground">
            Lead handling system
          </h3>
        </div>
        <span className="rounded-full border border-success/30 bg-success/10 px-3 py-1 text-xs font-medium text-success">
          Controlled
        </span>
      </div>

      <ol className="mt-5 space-y-3">
        {workflowSteps.map((step, index) => (
          <li key={step.title} className="grid grid-cols-[1.5rem_1fr] gap-3">
            <div className="flex flex-col items-center">
              {index === 0 ? (
                <CircleDot className="mt-1 size-4 text-primary" />
              ) : (
                <CheckCircle2 className="mt-1 size-4 text-success" />
              )}
              {index < workflowSteps.length - 1 ? (
                <ArrowDown className="mt-2 size-3 text-muted-foreground" />
              ) : null}
            </div>
            <div className="rounded-md border border-white/10 bg-white/[0.035] px-4 py-3">
              <p className="text-sm font-medium text-foreground">
                {step.title}
              </p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {step.note}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </GlassCard>
  );
}
