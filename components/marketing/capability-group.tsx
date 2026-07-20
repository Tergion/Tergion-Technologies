import { ChevronDown } from "lucide-react";

import type { ServiceCapabilityGroup } from "@/features/services/service-capabilities.types";
import { cn } from "@/lib/utils";

type CapabilityGroupProps = {
  group: ServiceCapabilityGroup;
  opensUpOnDesktop?: boolean;
};

export function CapabilityGroup({
  group,
  opensUpOnDesktop = false,
}: CapabilityGroupProps) {
  return (
    <details
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
      <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-left focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[var(--island-focus-ring)]">
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
          "mt-5 grid gap-2 text-sm leading-6 text-muted-foreground sm:grid-cols-2 lg:absolute lg:left-[-1px] lg:right-[-1px] lg:z-30 lg:m-0 lg:border lg:border-[color:var(--glass-border)] lg:bg-white lg:p-6 lg:shadow-[var(--glass-shadow)]",
          opensUpOnDesktop
            ? "lg:bottom-full lg:-mb-px lg:rounded-t-lg lg:border-b-0"
            : "lg:top-full lg:-mt-px lg:rounded-b-lg lg:border-t-0",
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
