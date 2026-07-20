import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type SectionShellProps = {
  eyebrow?: string;
  title?: string;
  description?: string;
  children: ReactNode;
  id?: string;
  className?: string;
  tone?: "default" | "soft-blue" | "navy";
};

export function SectionShell({
  eyebrow,
  title,
  description,
  children,
  id,
  className,
  tone = "default",
}: SectionShellProps) {
  const isNavy = tone === "navy";

  return (
    <section
      id={id}
      className={cn(
        "py-16 md:py-24",
        tone === "soft-blue" && "bg-[var(--surface-blue-soft)]",
        isNavy && "bg-[var(--surface-navy)] text-[color:var(--text-on-navy)]",
        className,
      )}
    >
      <div className="site-container">
        {title ? (
          <div className="mb-8 max-w-3xl md:mb-10">
            {eyebrow ? (
              <p
                className={cn(
                  "text-sm font-semibold uppercase tracking-[0.18em]",
                  isNavy
                    ? "text-[color:var(--text-on-navy-muted)]"
                    : "text-accent-strong",
                )}
              >
                {eyebrow}
              </p>
            ) : null}
            <h2
              className={cn(
                "mt-4 text-3xl font-semibold tracking-tight md:text-4xl xl:text-5xl",
                isNavy ? "text-[color:var(--text-on-navy)]" : "text-foreground",
              )}
            >
              {title}
            </h2>
            {description ? (
              <p
                className={cn(
                  "mt-5 text-base leading-7 md:text-lg",
                  isNavy
                    ? "text-[color:var(--text-on-navy-muted)]"
                    : "text-muted-foreground",
                )}
              >
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
