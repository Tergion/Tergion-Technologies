"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useRef, type MouseEvent } from "react";

import type { ServiceCapabilityGroup } from "@/features/services/service-capabilities.types";
import { cn } from "@/lib/utils";

type CapabilityGroupProps = {
  group: ServiceCapabilityGroup;
  opensUpOnDesktop?: boolean;
};

const capabilityFadeDurationMs = 140;
const closeTimers = new WeakMap<HTMLDetailsElement, number>();

function cancelCapabilityClose(details: HTMLDetailsElement) {
  const timer = closeTimers.get(details);

  if (timer !== undefined) {
    window.clearTimeout(timer);
    closeTimers.delete(details);
  }

  delete details.dataset.state;
}

function closeCapability(
  details: HTMLDetailsElement,
  onClosed?: () => void,
) {
  cancelCapabilityClose(details);
  details.dataset.state = "closing";

  const duration = window.matchMedia("(prefers-reduced-motion: reduce)")
    .matches
    ? 0
    : capabilityFadeDurationMs;
  const timer = window.setTimeout(() => {
    details.open = false;
    delete details.dataset.state;
    closeTimers.delete(details);
    onClosed?.();
  }, duration);

  closeTimers.set(details, timer);
}

export function CapabilityGroup({
  group,
  opensUpOnDesktop = false,
}: CapabilityGroupProps) {
  const detailsRef = useRef<HTMLDetailsElement | null>(null);

  useEffect(
    () => () => {
      const details = detailsRef.current;

      if (details) {
        cancelCapabilityClose(details);
      }
    },
    [],
  );

  function handleSummaryClick(event: MouseEvent<HTMLElement>) {
    event.preventDefault();

    const details = detailsRef.current;

    if (!details) {
      return;
    }

    if (details.dataset.state === "closing") {
      cancelCapabilityClose(details);
      return;
    }

    if (details.open) {
      closeCapability(details);
      return;
    }

    const openGroup = document.querySelector<HTMLDetailsElement>(
      '[data-capability-group][open]',
    );

    if (openGroup && openGroup !== details) {
      closeCapability(openGroup, () => {
        if (details.isConnected) {
          details.open = true;
        }
      });
      return;
    }

    details.open = true;
  }

  return (
    <details
      ref={detailsRef}
      name="service-capability"
      data-capability-group
      data-dropdown-placement={opensUpOnDesktop ? "up" : "down"}
      className={cn(
        "glass-panel solid-panel gradient-border group relative rounded-lg p-5 md:p-6 lg:open:z-30",
        opensUpOnDesktop
          ? "lg:open:rounded-t-none"
          : "lg:open:rounded-b-none",
      )}
    >
      <summary
        className="flex cursor-pointer list-none items-start justify-between gap-4 text-left focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[var(--island-focus-ring)] lg:group-open:focus-visible:ring-0"
        onClick={handleSummaryClick}
      >
        <span>
          <span className="block text-lg font-semibold text-foreground">
            {group.title}
          </span>
          <span className="mt-2 block text-sm leading-6 text-muted-foreground">
            {group.summary}
          </span>
        </span>
        <ChevronDown
          className="mt-1 size-5 shrink-0 text-accent-strong transition group-open:rotate-180"
          aria-hidden="true"
        />
      </summary>
      <ul
        data-capability-items
        className={cn(
          "capability-dropdown-outline mt-5 grid gap-2 text-sm leading-6 text-muted-foreground sm:grid-cols-2 lg:absolute lg:left-[-1px] lg:right-[-1px] lg:z-30 lg:m-0 lg:border lg:border-[color:var(--glass-border)] lg:bg-white lg:p-6",
          opensUpOnDesktop
            ? "capability-dropdown-outline-up lg:bottom-full lg:-mb-px lg:rounded-t-lg lg:border-b-0"
            : "capability-dropdown-outline-down lg:top-full lg:-mt-px lg:rounded-b-lg lg:border-t-0",
        )}
      >
        {group.items.map((item) => (
          <li
            key={item}
            className="rounded-md border border-[color:var(--field-border)] bg-[var(--field-bg-muted)] px-3 py-2"
          >
            {item}
          </li>
        ))}
      </ul>
    </details>
  );
}
