"use client";

import { useId } from "react";

import { AutomationAssessmentForm } from "@/components/forms/automation-assessment-form";
import { LeadForm } from "@/components/forms/lead-form";
import type { RequestModalMode } from "@/components/forms/request-modal-provider";
import { RequestModalTabs } from "@/components/forms/request-modal-tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type LeadFormModalProps = {
  open: boolean;
  activeMode: RequestModalMode;
  triggerSource: string;
  onModeChange: (mode: RequestModalMode) => void;
  onOpenChange: (open: boolean) => void;
};

export function LeadFormModal({
  open,
  activeMode,
  triggerSource,
  onModeChange,
  onOpenChange,
}: LeadFormModalProps) {
  const idPrefix = useId();
  const tabIds = {
    quick_request: `${idPrefix}-quick-request-tab`,
    automation_assessment: `${idPrefix}-automation-assessment-tab`,
  };
  const panelIds = {
    quick_request: `${idPrefix}-quick-request-panel`,
    automation_assessment: `${idPrefix}-automation-assessment-panel`,
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[min(820px,calc(100dvh-24px))] w-[calc(100vw-24px)] max-w-none grid-rows-none flex-col gap-0 overflow-hidden rounded-lg border-[color:var(--modal-border)] bg-[var(--modal-bg)] p-0 shadow-[var(--modal-shadow)] ring-0 data-closed:zoom-out-100 data-open:zoom-in-100 sm:h-[min(820px,calc(100dvh-48px))] sm:w-[min(800px,calc(100vw-48px))] sm:max-w-none">
        <DialogHeader className="bg-[var(--modal-bg)] px-5 py-5 pr-14">
          <DialogTitle className="text-xl font-semibold tracking-tight">
            Choose how to start
          </DialogTitle>
          <DialogDescription>
            Send a quick request or answer a few questions about your business.
          </DialogDescription>
        </DialogHeader>
        <RequestModalTabs
          activeMode={activeMode}
          tabIds={tabIds}
          panelIds={panelIds}
          onModeChange={onModeChange}
        />
        <div
          id={panelIds.quick_request}
          role="tabpanel"
          aria-labelledby={tabIds.quick_request}
          hidden={activeMode !== "quick_request"}
          className="h-full min-h-0 flex-1"
        >
          <LeadForm
            active={activeMode === "quick_request"}
            triggerSource={triggerSource}
          />
        </div>
        <div
          id={panelIds.automation_assessment}
          role="tabpanel"
          aria-labelledby={tabIds.automation_assessment}
          hidden={activeMode !== "automation_assessment"}
          className="h-full min-h-0 flex-1"
        >
          <AutomationAssessmentForm
            active={activeMode === "automation_assessment"}
            triggerSource={triggerSource}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
