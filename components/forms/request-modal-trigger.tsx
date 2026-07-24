"use client";

import type { ComponentProps, ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { useRequestModal } from "@/components/forms/request-modal-provider";
import type { RequestModalMode } from "@/components/forms/request-modal-provider";
import { cn } from "@/lib/utils";

type RequestModalTriggerProps = Omit<
  ComponentProps<typeof Button>,
  "onClick" | "type"
> & {
  icon?: ReactNode;
  label?: string;
  mode?: RequestModalMode;
  triggerSource?: string;
};

export function RequestModalTrigger({
  children,
  className,
  icon,
  label = "Start when ready",
  mode = "quick_request",
  triggerSource,
  ...props
}: RequestModalTriggerProps) {
  const { openRequestModal } = useRequestModal();

  return (
    <Button
      type="button"
      className={cn(className)}
      onClick={(event) =>
        openRequestModal({
          mode,
          trigger: event.currentTarget,
          triggerSource,
        })
      }
      {...props}
    >
      {children ?? (
        <>
          {icon}
          <span>{label}</span>
        </>
      )}
    </Button>
  );
}
