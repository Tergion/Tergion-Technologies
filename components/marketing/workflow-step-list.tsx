"use client";

import { useEffect, useRef, useState, type FocusEvent } from "react";

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
  const [openStepIndex, setOpenStepIndex] = useState<number | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const openedByFocus = useRef(false);

  useEffect(() => {
    if (openStepIndex === null) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !listRef.current?.contains(event.target)
      ) {
        setOpenStepIndex(null);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [openStepIndex]);

  function openStep(index: number) {
    setOpenStepIndex(index);
    onStepChange(index);
  }

  function openStepFromFocus(index: number) {
    if (openStepIndex !== index) {
      openedByFocus.current = true;
    }

    openStep(index);
  }

  function toggleStep(index: number) {
    setOpenStepIndex((current) => (current === index ? null : index));
    onStepChange(index);
  }

  function handleBlur(event: FocusEvent<HTMLLIElement>) {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setOpenStepIndex(null);
    }
  }

  return (
    <div
      ref={listRef}
      className="relative min-w-0 overflow-visible rounded-lg border border-[color:var(--field-border)] bg-[var(--field-bg-muted)] p-3 sm:p-4"
    >
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

      <ol className="relative mt-4 grid gap-2 overflow-visible md:grid-cols-2 xl:grid-cols-3">
        {steps.map((step, index) => {
          const isActive = index === activeStepIndex;
          const isOpen = index === openStepIndex;
          const detailId = `${workflowSlug}-step-${index + 1}-details`;
          const opensUp = index >= Math.max(steps.length - 3, 0);

          return (
            <li
              key={`${workflowSlug}-${step.title}`}
              className={cn("relative min-w-0", isOpen ? "z-30" : "z-0")}
              onPointerEnter={(event) => {
                if (event.pointerType === "mouse") {
                  openStep(index);
                }
              }}
              onPointerLeave={(event) => {
                if (event.pointerType === "mouse") {
                  setOpenStepIndex(null);
                }
              }}
              onBlur={handleBlur}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  setOpenStepIndex(null);
                }
              }}
            >
              <button
                type="button"
                className={cn(
                  "flex w-full min-w-0 items-start gap-3 rounded-md border px-3 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isActive || isOpen
                    ? "border-[color:var(--island-active-border)] bg-[var(--island-active-bg)] shadow-md shadow-accent-strong/10"
                    : "border-[color:var(--field-border)] bg-[var(--field-bg)] hover:bg-[var(--island-hover-bg)]",
                  isOpen && "rounded-b-none",
                  isOpen && opensUp && "md:rounded-b-md md:rounded-t-none",
                )}
                aria-expanded={isOpen}
                aria-controls={detailId}
                onClick={() => {
                  if (openedByFocus.current && openStepIndex === index) {
                    openedByFocus.current = false;
                    return;
                  }

                  openedByFocus.current = false;
                  toggleStep(index);
                }}
                onFocus={() => openStepFromFocus(index)}
              >
                <span
                  className={cn(
                    "mt-0.5 grid size-7 shrink-0 place-items-center rounded-md border text-[0.68rem] font-semibold",
                    isActive || isOpen
                      ? "border-[color:var(--island-active-border)] bg-[var(--active-chip-bg)] text-accent-strong"
                      : "border-[color:var(--field-border)] text-muted-foreground",
                  )}
                  aria-hidden="true"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      "block text-sm font-semibold",
                      isActive || isOpen
                        ? "text-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    {step.title}
                  </span>
                  {step.controlPoint ? (
                    <span
                      className={cn(
                        "mt-1 inline-flex rounded-full border px-2 py-0.5 text-[0.68rem] font-medium",
                        isActive || isOpen
                          ? "border-[color:var(--island-active-border)] bg-[var(--active-chip-bg)] text-accent-strong"
                          : "border-[color:var(--field-border)] text-muted-foreground",
                      )}
                    >
                      {step.controlPoint}
                    </span>
                  ) : null}
                </span>
              </button>

              {isOpen ? (
                <div
                  id={detailId}
                  role="region"
                  aria-label={`${step.title} explanation`}
                  className={cn(
                    "workflow-panel rounded-b-md border-t-0 px-4 py-3 text-sm leading-6 text-muted-foreground md:absolute md:left-0 md:right-0 md:z-30",
                    opensUp
                      ? "md:bottom-full md:mb-[-1px] md:rounded-b-none md:rounded-t-md md:border-b-0 md:border-t"
                      : "md:top-full md:-mt-px md:rounded-b-md md:border-t-0",
                  )}
                >
                  {step.summary}
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
