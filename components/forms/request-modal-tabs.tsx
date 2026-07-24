"use client";

import { Check } from "lucide-react";
import { useRef, type KeyboardEvent } from "react";

import type { RequestModalMode } from "@/components/forms/request-modal-provider";
import { cn } from "@/lib/utils";

const tabs = [
  { mode: "quick_request", label: "Quick Request" },
  { mode: "automation_assessment", label: "Automation Assessment" },
] as const;

type RequestModalTabsProps = {
  activeMode: RequestModalMode;
  tabIds: Record<RequestModalMode, string>;
  panelIds: Record<RequestModalMode, string>;
  onModeChange: (mode: RequestModalMode) => void;
};

export function RequestModalTabs({
  activeMode,
  tabIds,
  panelIds,
  onModeChange,
}: RequestModalTabsProps) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  function selectAndFocus(index: number) {
    const nextIndex = (index + tabs.length) % tabs.length;
    const nextTab = tabs[nextIndex];

    onModeChange(nextTab.mode);
    window.requestAnimationFrame(() => refs.current[nextIndex]?.focus());
  }

  function handleKeyDown(
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
      selectAndFocus(tabs.length - 1);
    }
  }

  return (
    <div
      role="tablist"
      aria-label="Request type"
      className="grid grid-cols-2 gap-2 border-b border-[color:var(--field-border)] bg-[var(--modal-bg)] px-5 pb-4"
    >
      {tabs.map((tab, index) => {
        const active = tab.mode === activeMode;

        return (
          <button
            key={tab.mode}
            ref={(node) => {
              refs.current[index] = node;
            }}
            id={tabIds[tab.mode]}
            type="button"
            role="tab"
            aria-selected={active}
            aria-controls={panelIds[tab.mode]}
            tabIndex={active ? 0 : -1}
            className={cn(
              "relative flex min-h-12 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition-[background-color,border-color,color,box-shadow] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[var(--island-focus-ring)]",
              active
                ? "border-[color:var(--island-active-border)] bg-[var(--island-active-bg)] text-foreground shadow-sm"
                : "border-[color:var(--field-border)] bg-[var(--field-bg-muted)] text-muted-foreground hover:bg-[var(--island-hover-bg)] hover:text-foreground",
            )}
            onClick={() => onModeChange(tab.mode)}
            onKeyDown={(event) => handleKeyDown(event, index)}
          >
            {active ? <Check className="size-4" aria-hidden="true" /> : null}
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
