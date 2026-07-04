"use client";

import Image from "next/image";

import type { WorkflowShowcase } from "@/features/workflows/workflow.types";
import { cn } from "@/lib/utils";

type WorkflowShowcaseVisualProps = {
  workflow: WorkflowShowcase;
  activeStepIndex: number;
};

export function WorkflowShowcaseVisual({
  workflow,
  activeStepIndex,
}: WorkflowShowcaseVisualProps) {
  const activeStep = workflow.steps[activeStepIndex] ?? workflow.steps[0];

  if (workflow.imageSrc) {
    return (
      <div className="min-w-0 overflow-hidden rounded-lg border border-white/10 bg-white/[0.025] p-3">
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
    <div
      role="img"
      aria-label={workflow.imageAlt}
      className="relative min-w-0 overflow-hidden rounded-lg border border-white/10 bg-[linear-gradient(135deg,rgba(102,232,255,0.08),rgba(255,255,255,0.025)_42%,rgba(105,230,165,0.06))] p-4 shadow-inner shadow-black/20 sm:p-5"
    >
      <div aria-hidden="true" className="relative z-10">
        <div className="flex min-w-0 items-start justify-between gap-4 border-b border-white/10 pb-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Example preview
            </p>
            <h3 className="mt-2 text-lg font-semibold text-foreground">
              {workflow.tabLabel}
            </h3>
          </div>
          <span className="shrink-0 rounded-full border border-success/30 bg-success/10 px-3 py-1 text-xs font-medium text-success">
            Controlled
          </span>
        </div>

        <ol className="relative mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {workflow.steps.map((step, index) => {
            const isActive = index === activeStepIndex;

            return (
              <li
                key={`${workflow.slug}-visual-${step.title}`}
                className={cn(
                  "min-h-24 rounded-md border p-3 transition duration-200",
                  isActive
                    ? "border-primary/70 bg-primary/[0.12] shadow-[0_0_28px_rgba(102,232,255,0.14)] ring-1 ring-primary/40"
                    : "border-white/10 bg-white/[0.035]",
                )}
              >
                <span
                  className={cn(
                    "inline-grid size-7 place-items-center rounded-md border text-[0.68rem] font-semibold",
                    isActive
                      ? "border-primary/60 bg-primary/[0.15] text-primary"
                      : "border-white/10 text-muted-foreground",
                  )}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="mt-3 text-sm font-semibold leading-5 text-foreground">
                  {step.controlPoint ?? step.title}
                </p>
                <p className="mt-1 text-[0.68rem] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                  {isActive ? "Active step" : "Control"}
                </p>
              </li>
            );
          })}
        </ol>

        <div className="mt-4 rounded-md border border-primary/25 bg-primary/[0.08] p-3">
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
    </div>
  );
}
