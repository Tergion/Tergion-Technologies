"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FocusEvent,
} from "react";

import type { WorkflowStep } from "@/features/workflows/workflow.types";
import { cn } from "@/lib/utils";

type WorkflowStepListProps = {
  workflowSlug: string;
  steps: WorkflowStep[];
  activeStepIndex: number;
  onStepChange: (index: number) => void;
};

const detailFadeDurationMs = 140;

export function WorkflowStepList({
  workflowSlug,
  steps,
  activeStepIndex,
  onStepChange,
}: WorkflowStepListProps) {
  const [openStepIndex, setOpenStepIndex] = useState<number | null>(null);
  const [closingStepIndex, setClosingStepIndex] = useState<number | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const openedByFocus = useRef(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startClosingStep = useCallback((index: number) => {
    if (closeTimerRef.current !== null) {
      clearTimeout(closeTimerRef.current);
    }

    setClosingStepIndex(index);
    const duration = window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches
      ? 0
      : detailFadeDurationMs;

    closeTimerRef.current = setTimeout(() => {
      setClosingStepIndex((current) => (current === index ? null : current));
      closeTimerRef.current = null;
    }, duration);
  }, []);

  const closeOpenStep = useCallback(() => {
    if (openStepIndex === null) {
      return;
    }

    startClosingStep(openStepIndex);
    setOpenStepIndex(null);
  }, [openStepIndex, startClosingStep]);

  useEffect(() => {
    if (openStepIndex === null) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !listRef.current?.contains(event.target)
      ) {
        closeOpenStep();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [closeOpenStep, openStepIndex]);

  useEffect(
    () => () => {
      if (closeTimerRef.current !== null) {
        clearTimeout(closeTimerRef.current);
      }
    },
    [],
  );

  function openStep(index: number) {
    if (openStepIndex !== null && openStepIndex !== index) {
      startClosingStep(openStepIndex);
    }

    if (closingStepIndex === index) {
      if (closeTimerRef.current !== null) {
        clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }

      setClosingStepIndex(null);
    }

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
    if (openStepIndex === index) {
      closeOpenStep();
      return;
    }

    openStep(index);
  }

  function handleBlur(event: FocusEvent<HTMLLIElement>) {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      closeOpenStep();
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
          const isClosing = index === closingStepIndex;
          const isConnected = isOpen || isClosing;
          const isHighlighted = isActive || isConnected;
          const detailId = `${workflowSlug}-step-${index + 1}-details`;
          const opensUp = index >= Math.max(steps.length - 3, 0);

          return (
            <li
              key={`${workflowSlug}-${step.title}`}
              data-workflow-step-item
              data-state={isOpen ? "open" : isClosing ? "closing" : "closed"}
              className={cn(
                "relative min-w-0",
                isConnected ? "workflow-step-connected z-30" : "z-auto",
              )}
              onPointerEnter={(event) => {
                if (event.pointerType === "mouse") {
                  openStep(index);
                }
              }}
              onPointerLeave={(event) => {
                if (event.pointerType === "mouse") {
                  closeOpenStep();
                }
              }}
              onBlur={handleBlur}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  closeOpenStep();
                }
              }}
            >
              <button
                type="button"
                data-workflow-step-trigger
                className={cn(
                  "flex w-full min-w-0 items-start gap-3 rounded-md border px-3 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isHighlighted
                    ? "border-[color:var(--border-strong)] bg-[var(--island-active-bg)]"
                    : "border-[color:var(--field-border)] bg-[var(--field-bg)] hover:bg-[var(--island-hover-bg)]",
                  isActive &&
                    !isConnected &&
                    "shadow-md shadow-accent-strong/10",
                  isConnected &&
                    "rounded-b-none border-b-transparent shadow-none",
                  isConnected &&
                    opensUp &&
                    "md:rounded-b-md md:rounded-t-none md:border-b-[color:var(--border-strong)] md:border-t-transparent",
                )}
                aria-current={isActive ? "step" : undefined}
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
                    isHighlighted
                      ? "border-[color:var(--border-strong)] bg-[var(--active-chip-bg)] text-accent-strong"
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
                      isHighlighted
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
                        isHighlighted
                          ? "border-[color:var(--border-strong)] bg-[var(--active-chip-bg)] text-accent-strong"
                          : "border-[color:var(--field-border)] text-muted-foreground",
                      )}
                    >
                      {step.controlPoint}
                    </span>
                  ) : null}
                </span>
              </button>

              {isConnected ? (
                <div
                  id={detailId}
                  role="region"
                  aria-label={`${step.title} explanation`}
                  aria-hidden={!isOpen}
                  data-workflow-step-details
                  data-state={isOpen ? "open" : "closing"}
                  className={cn(
                    "workflow-panel rounded-b-md border-[color:var(--border-strong)] border-t-0 px-4 py-3 text-sm leading-6 text-muted-foreground shadow-none md:absolute md:left-0 md:right-0 md:z-30",
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
