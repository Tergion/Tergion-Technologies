import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type SectionShellProps = {
  eyebrow?: string;
  title?: string;
  description?: string;
  children: ReactNode;
  id?: string;
  className?: string;
};

export function SectionShell({
  eyebrow,
  title,
  description,
  children,
  id,
  className,
}: SectionShellProps) {
  return (
    <section id={id} className={cn("px-6 py-16 md:py-24", className)}>
      <div className="mx-auto max-w-7xl">
        {title ? (
          <div className="mb-8 max-w-3xl md:mb-10">
            {eyebrow ? (
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                {eyebrow}
              </p>
            ) : null}
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground md:text-4xl xl:text-5xl">
              {title}
            </h2>
            {description ? (
              <p className="mt-5 text-base leading-7 text-muted-foreground md:text-lg">
                {description}
              </p>
            ) : null}
          </div>
        ) : null}
        {children}
      </div>
    </section>
  );
}
