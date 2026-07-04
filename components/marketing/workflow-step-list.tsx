"use client";

import type { WorkflowStep } from "@/features/workflows/workflow.types";
import { cn } from "@/lib/utils";

type WorkflowStepListProps = {
  workflowSlug: string;
  steps: WorkflowStep[];
  activeStepIndex: number;
  onStepChange: (index: number) => void;
};

export function WorkflowStepList({
  workflowSlug,
  steps,
  activeStepIndex,
  onStepChange,
}: WorkflowStepListProps) {
  return (
    <div className="min-w-0 rounded-lg border border-white/10 bg-white/[0.025] p-3 sm:p-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Control points
          </p>
          <h3 className="mt-2 text-base font-semibold text-foreground">
            Select a step to see what changes.
          </h3>
        </div>
        <p className="text-xs text-muted-foreground">
          {steps.length} mapped steps
        </p>
      </div>

      <ol className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
        {steps.map((step, index) => {
          const isActive = index === activeStepIndex;
          const detailId = `${workflowSlug}-step-${index + 1}-details`;

          return (
            <li key={`${workflowSlug}-${step.title}`} className="min-w-0">
              <button
                type="button"
                className={cn(
                  "flex w-full min-w-0 items-start gap-3 rounded-md border px-3 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isActive
                    ? "border-primary/70 bg-primary/[0.08] shadow-md shadow-primary/10"
                    : "border-white/10 bg-white/[0.025] hover:border-white/20 hover:bg-white/[0.05]",
                )}
                aria-expanded={isActive}
                aria-controls={detailId}
                onClick={() => onStepChange(index)}
                onFocus={() => onStepChange(index)}
              >
                <span
                  className={cn(
                    "mt-0.5 grid size-7 shrink-0 place-items-center rounded-md border text-[0.68rem] font-semibold",
                    isActive
                      ? "border-primary/50 bg-primary/[0.15] text-primary"
                      : "border-white/10 text-muted-foreground",
                  )}
                  aria-hidden="true"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      "block text-sm font-semibold",
                      isActive ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {step.title}
                  </span>
                  {step.controlPoint ? (
                    <span
                      className={cn(
                        "mt-1 inline-flex rounded-full border px-2 py-0.5 text-[0.68rem] font-medium",
                        isActive
                          ? "border-primary/40 bg-primary/10 text-primary"
                          : "border-white/10 text-muted-foreground",
                      )}
                    >
                      {step.controlPoint}
                    </span>
                  ) : null}
                </span>
              </button>

              <div
                id={detailId}
                role="region"
                aria-label={`${step.title} explanation`}
                hidden={!isActive}
                className="rounded-b-md border border-t-0 border-primary/30 bg-black/15 px-4 py-3 text-sm leading-6 text-muted-foreground"
              >
                {step.summary}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
