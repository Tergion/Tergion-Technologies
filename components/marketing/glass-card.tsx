import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

export function GlassCard({
  className,
  ...props
}: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={cn("glass-panel gradient-border rounded-lg", className)}
      {...props}
    />
  );
}
