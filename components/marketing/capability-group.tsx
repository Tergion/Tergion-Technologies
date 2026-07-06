import { ChevronDown } from "lucide-react";

import type { ServiceCapabilityGroup } from "@/features/services/service-capabilities.types";

export function CapabilityGroup({ group }: { group: ServiceCapabilityGroup }) {
  return (
    <details className="glass-panel gradient-border group rounded-lg p-5 md:p-6">
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
      <ul className="mt-5 grid gap-2 text-sm leading-6 text-muted-foreground sm:grid-cols-2">
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
