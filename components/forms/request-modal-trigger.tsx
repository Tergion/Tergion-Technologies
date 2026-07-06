"use client";

import type { ComponentProps, ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { useRequestModal } from "@/components/forms/request-modal-provider";
import { cn } from "@/lib/utils";

type RequestModalTriggerProps = Omit<
  ComponentProps<typeof Button>,
  "onClick" | "type"
> & {
  icon?: ReactNode;
  label?: string;
};

export function RequestModalTrigger({
  children,
  className,
  icon,
  label = "Start the request",
  ...props
}: RequestModalTriggerProps) {
  const { openRequestModal } = useRequestModal();

  return (
    <Button
      type="button"
      className={cn(className)}
      onClick={(event) => openRequestModal(event.currentTarget)}
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
