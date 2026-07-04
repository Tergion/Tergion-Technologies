"use client";

import { useRef, type KeyboardEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import type { WorkflowShowcase } from "@/features/workflows/workflow.types";
import { cn } from "@/lib/utils";

type WorkflowShowcaseTabsProps = {
  workflows: WorkflowShowcase[];
  activeIndex: number;
  panelId: string;
  tabIdFor: (workflow: WorkflowShowcase) => string;
  onSelect: (index: number) => void;
  onPrevious: () => void;
  onNext: () => void;
};

export function WorkflowShowcaseTabs({
  workflows,
  activeIndex,
  panelId,
  tabIdFor,
  onSelect,
  onPrevious,
  onNext,
}: WorkflowShowcaseTabsProps) {
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  function selectAndFocus(index: number) {
    const nextIndex = (index + workflows.length) % workflows.length;

    onSelect(nextIndex);
    window.requestAnimationFrame(() => {
      tabRefs.current[nextIndex]?.focus();
    });
  }

  function handleTabKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      selectAndFocus(index + 1);
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      selectAndFocus(index - 1);
    }

    if (event.key === "Home") {
      event.preventDefault();
      selectAndFocus(0);
    }

    if (event.key === "End") {
      event.preventDefault();
      selectAndFocus(workflows.length - 1);
    }
  }

  return (
    <div className="flex min-w-0 flex-col gap-3 border-b border-white/10 pb-4 md:flex-row md:items-center md:justify-between">
      <div
        role="tablist"
        aria-label="Workflow examples"
        className="-mx-1 flex min-w-0 gap-2 overflow-x-auto px-1 pb-2 md:mx-0 md:pb-0"
      >
        {workflows.map((workflow, index) => {
          const isActive = index === activeIndex;

          return (
            <button
              key={workflow.slug}
              ref={(node) => {
                tabRefs.current[index] = node;
              }}
              type="button"
              role="tab"
              id={tabIdFor(workflow)}
              aria-selected={isActive}
              aria-controls={panelId}
              tabIndex={isActive ? 0 : -1}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isActive
                  ? "border-primary/70 bg-primary/[0.12] text-foreground shadow-md shadow-primary/10"
                  : "border-white/10 bg-white/[0.035] text-muted-foreground hover:border-white/20 hover:bg-white/[0.06] hover:text-foreground",
              )}
              onClick={() => onSelect(index)}
              onKeyDown={(event) => handleTabKeyDown(event, index)}
            >
              <span
                className={cn(
                  "grid size-6 place-items-center rounded-md border text-[0.68rem]",
                  isActive
                    ? "border-primary/50 bg-primary/[0.15] text-primary"
                    : "border-white/10 text-muted-foreground",
                )}
                aria-hidden="true"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <span>{workflow.tabLabel}</span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Show previous workflow"
          className="grid size-10 place-items-center rounded-lg border border-white/10 bg-white/[0.035] text-muted-foreground transition hover:border-white/20 hover:bg-white/[0.06] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={onPrevious}
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label="Show next workflow"
          className="grid size-10 place-items-center rounded-lg border border-white/10 bg-white/[0.035] text-muted-foreground transition hover:border-white/20 hover:bg-white/[0.06] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={onNext}
        >
          <ChevronRight className="size-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
