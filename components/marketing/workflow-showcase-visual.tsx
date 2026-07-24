"use client";

import Image from "next/image";

import type { WorkflowShowcase } from "@/features/workflows/workflow.types";
import { cn } from "@/lib/utils";

type WorkflowShowcaseVisualProps = {
  workflow: WorkflowShowcase;
  activeStepIndex: number;
  onStepChange: (index: number) => void;
};

export function WorkflowShowcaseVisual({
  workflow,
  activeStepIndex,
  onStepChange,
}: WorkflowShowcaseVisualProps) {
  const activeStep = workflow.steps[activeStepIndex] ?? workflow.steps[0];
  const headingId = `${workflow.slug}-visual-heading`;
  const descriptionId = `${workflow.slug}-visual-description`;

  if (workflow.imageSrc) {
    return (
      <div className="min-w-0 overflow-hidden rounded-lg border border-[color:var(--field-border)] bg-[var(--field-bg-muted)] p-3">
        <Image
          src={workflow.imageSrc}
          alt={workflow.imageAlt}
          width={960}
          height={640}
          sizes="(min-width: 1280px) 48vw, 100vw"
          loading="lazy"
          className="h-auto w-full rounded-md object-cover"
        />
      </div>
    );
  }

  return (
    <section
      data-workflow-preview
      aria-labelledby={headingId}
      aria-describedby={descriptionId}
      className="relative min-w-0 overflow-hidden rounded-lg border border-[color:var(--field-border)] bg-[linear-gradient(135deg,var(--surface-blue-soft),var(--surface)_48%,var(--surface-muted))] p-4 shadow-inner shadow-accent-strong/10 sm:p-5"
    >
      <p id={descriptionId} className="sr-only">
        {workflow.imageAlt}
      </p>
      <div className="relative z-10">
        <div className="flex min-w-0 items-start justify-between gap-4 border-b border-[color:var(--field-border)] pb-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Example preview
            </p>
            <h3
              id={headingId}
              className="mt-2 text-lg font-semibold text-foreground"
            >
              {workflow.tabLabel}
            </h3>
          </div>
          <span className="shrink-0 rounded-full border border-success/30 bg-[var(--success-panel-bg)] px-3 py-1 text-xs font-medium text-success">
            Controlled
          </span>
        </div>

        <ol className="relative mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {workflow.steps.map((step, index) => {
            const isActive = index === activeStepIndex;

            return (
              <li key={`${workflow.slug}-visual-${step.title}`}>
                <button
                  type="button"
                  data-workflow-preview-step
                  aria-label={`Step ${index + 1}: ${step.title}`}
                  aria-current={isActive ? "step" : undefined}
                  className={cn(
                    "min-h-24 w-full rounded-md border p-3 text-left transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    isActive
                      ? "border-[color:var(--border-strong)] bg-[var(--island-active-bg)] shadow-md shadow-accent-strong/10"
                      : "border-[color:var(--field-border)] bg-[var(--field-bg)] hover:bg-[var(--island-hover-bg)]",
                  )}
                  onClick={() => onStepChange(index)}
                >
                  <span
                    className={cn(
                      "inline-grid size-7 place-items-center rounded-md border text-[0.68rem] font-semibold",
                      isActive
                        ? "border-[color:var(--border-strong)] bg-[var(--active-chip-bg)] text-accent-strong"
                        : "border-[color:var(--field-border)] text-muted-foreground",
                    )}
                    aria-hidden="true"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="mt-3 block text-sm font-semibold leading-5 text-foreground">
                    {step.controlPoint ?? step.title}
                  </span>
                  <span className="mt-1 block text-[0.68rem] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                    {isActive ? "Active step" : "Control"}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        <div
          data-workflow-preview-details
          className="mt-4 rounded-md border border-[color:var(--border-strong)] bg-[var(--island-active-bg)] p-3"
        >
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-primary">
            Highlighted control point
          </p>
          <p className="mt-1 text-sm font-semibold text-foreground">
            {activeStep.controlPoint ?? activeStep.title}
          </p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {activeStep.title}
          </p>
        </div>
      </div>
    </section>
  );
}
