"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { ArrowUpRight } from "lucide-react";

import { RequestModalTrigger } from "@/components/forms/request-modal-trigger";
import { WorkflowShowcaseTabs } from "@/components/marketing/workflow-showcase-tabs";
import { WorkflowShowcaseVisual } from "@/components/marketing/workflow-showcase-visual";
import { WorkflowStepList } from "@/components/marketing/workflow-step-list";
import { buttonVariants } from "@/components/ui/button";
import type { WorkflowShowcase as WorkflowShowcaseItem } from "@/features/workflows/workflow.types";
import { siteConfig } from "@/lib/site-config";

type WorkflowShowcaseProps = {
  workflows: WorkflowShowcaseItem[];
};

export function WorkflowShowcase({ workflows }: WorkflowShowcaseProps) {
  const id = useId().replaceAll(":", "");
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  if (workflows.length === 0) {
    return null;
  }

  const panelId = `${id}-workflow-panel`;
  const activeWorkflow = workflows[activeIndex] ?? workflows[0];
  const activeTabId = tabIdFor(activeWorkflow);

  function tabIdFor(workflow: WorkflowShowcaseItem) {
    return `${id}-${workflow.slug}-tab`;
  }

  function selectWorkflow(index: number) {
    const nextIndex = (index + workflows.length) % workflows.length;

    setActiveIndex(nextIndex);
    setActiveStepIndex(0);
  }

  return (
    <div className="overflow-visible rounded-lg border border-[color:var(--field-border)] bg-white p-4 shadow-[0_18px_44px_rgba(19,42,70,0.1)] sm:p-5 lg:p-6">
      <WorkflowShowcaseTabs
        workflows={workflows}
        activeIndex={activeIndex}
        panelId={panelId}
        tabIdFor={tabIdFor}
        onSelect={selectWorkflow}
        onPrevious={() => selectWorkflow(activeIndex - 1)}
        onNext={() => selectWorkflow(activeIndex + 1)}
      />

      <div
        key={activeWorkflow.slug}
        id={panelId}
        role="tabpanel"
        aria-labelledby={activeTabId}
        className="mt-5 min-w-0"
      >
        <div className="min-w-0 space-y-5">
          <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)] xl:items-start">
            <div className="rounded-lg border border-[color:var(--field-border)] bg-[var(--field-bg-muted)] p-5 sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                {activeWorkflow.eyebrow}
              </p>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                {activeWorkflow.headline}
              </h3>
              <p className="mt-4 text-sm leading-6 text-muted-foreground md:text-base md:leading-7">
                {activeWorkflow.summary}
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={activeWorkflow.exampleHref}
                  className={buttonVariants({
                    className:
                      "h-auto min-h-11 w-full whitespace-normal px-4 py-2.5 text-center sm:w-auto",
                  })}
                >
                  <span>{activeWorkflow.primaryCta}</span>
                  <ArrowUpRight className="size-4" aria-hidden="true" />
                </Link>
                <RequestModalTrigger
                  variant="outline"
                  className="h-auto min-h-11 w-full border-[color:var(--field-border)] bg-[var(--field-bg)] px-4 py-2.5 text-foreground sm:w-auto"
                >
                  {siteConfig.cta.workflow}
                </RequestModalTrigger>
              </div>
            </div>

            <WorkflowShowcaseVisual
              workflow={activeWorkflow}
              activeStepIndex={activeStepIndex}
              onStepChange={setActiveStepIndex}
            />
          </div>

          <WorkflowStepList
            workflowSlug={activeWorkflow.slug}
            steps={activeWorkflow.steps}
            activeStepIndex={activeStepIndex}
            onStepChange={setActiveStepIndex}
          />
        </div>
      </div>
    </div>
  );
}
