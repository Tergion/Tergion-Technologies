"use client";

import { LeadForm } from "@/components/forms/lead-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type LeadFormModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function LeadFormModal({ open, onOpenChange }: LeadFormModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[min(720px,calc(100dvh-24px))] w-[calc(100vw-24px)] max-w-none grid-rows-none flex-col gap-0 overflow-hidden rounded-lg border-[color:var(--modal-border)] bg-[var(--modal-bg)] p-0 shadow-[var(--modal-shadow)] ring-0 sm:h-[min(720px,calc(100dvh-48px))] sm:w-[min(760px,calc(100vw-48px))] sm:max-w-none">
        <DialogHeader className="border-b border-[color:var(--field-border)] bg-[var(--modal-bg)] px-5 py-5 pr-14">
          <DialogTitle className="text-xl font-semibold tracking-tight">
            Request a free automation review
          </DialogTitle>
          <DialogDescription>
            Start with the basics. The business details are optional. We&apos;ll
            follow up based on your preferred contact method.
          </DialogDescription>
        </DialogHeader>
        <LeadForm />
      </DialogContent>
    </Dialog>
  );
}
