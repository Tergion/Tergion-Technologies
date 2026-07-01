"use client";

import type { ReactNode } from "react";
import { useState } from "react";

import { LeadForm } from "@/components/forms/lead-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type LeadFormModalProps = {
  label: string;
  className?: string;
  icon?: ReactNode;
};

export function LeadFormModal({ label, className, icon }: LeadFormModalProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        className={cn("shadow-lg shadow-primary/10", className)}
        onClick={() => setOpen(true)}
      >
        {icon}
        <span>{label}</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto border border-glass-border bg-popover/95 p-5 sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">
              Request a free automation review
            </DialogTitle>
            <DialogDescription>
              Start with the basics. The business details are optional. We can
              figure out the rest during the strategy session.
            </DialogDescription>
          </DialogHeader>
          <LeadForm />
        </DialogContent>
      </Dialog>
    </>
  );
}
