"use client";

import { useState } from "react";
import { ArrowDown, CheckCircle2, CircleDot } from "lucide-react";

import { GlassCard } from "@/components/marketing/glass-card";
import { cn } from "@/lib/utils";

const workflowSteps = [
  {
    title: "New website lead received",
    note: "Capture the request with source and context.",
    label: "Website form",
    trigger: "A visitor asks for pricing, a quote, or a callback.",
    systemAction:
      "The submission is captured with the page, source, and requested service attached.",
    control:
      "The team can review the request before any high-intent follow-up is sent.",
    result: "The lead starts with useful context instead of a loose inbox note.",
  },
  {
    title: "Contact added to CRM",
    note: "Keep the record visible to the team.",
    label: "CRM record",
    trigger: "A new or existing contact enters the workflow.",
    systemAction:
      "The CRM creates or updates the record, assigns a pipeline stage, and keeps the conversation history together.",
    control:
      "Ownership rules decide who sees the record and who is responsible for next steps.",
    result: "The lead is trackable instead of scattered across email, calls, and forms.",
  },
  {
    title: "AI-assisted qualification note created",
    note: "Summarize context for human review.",
    label: "Review note",
    trigger: "The CRM has enough context to summarize the request.",
    systemAction:
      "AI support drafts a short qualification note from the form fields and conversation context.",
    control:
      "A person reviews the note before relying on it for sales or service decisions.",
    result: "The team gets a faster read without handing judgment to automation.",
  },
  {
    title: "Follow-up email or SMS queued",
    note: "Use approved timing and message rules.",
    label: "Follow-up",
    trigger: "The lead needs a next step after submission or missed contact.",
    systemAction:
      "A message is queued from approved templates using the preferred contact method and timing rules.",
    control:
      "SMS is only used when consent and business rules support it.",
    result: "Follow-up becomes consistent without sounding improvised.",
  },
  {
    title: "Task assigned to team",
    note: "Give ownership to the right person.",
    label: "Team task",
    trigger: "A human action is needed, such as review, call-back, quote prep, or scheduling.",
    systemAction:
      "The workflow creates a task with the relevant contact, due time, and context.",
    control:
      "The business decides which actions should stay manual and who should own them.",
    result: "Important work has a clear owner instead of relying on memory.",
  },
  {
    title: "Review or appointment reminder scheduled",
    note: "Keep next steps from falling through.",
    label: "Reminder",
    trigger: "A scheduled event or completed service creates a follow-up opportunity.",
    systemAction:
      "The system schedules a reminder, review request, or appointment prompt based on approved rules.",
    control:
      "Timing and messaging can stay conservative, appropriate, and reviewable.",
    result: "Next steps remain visible after the first response.",
  },
];

export function WorkflowMockup({ compact = false }: { compact?: boolean }) {
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [pinnedStep, setPinnedStep] = useState<number | null>(null);
  const visibleStep = pinnedStep ?? activeStep;

  function clearPreview() {
    setActiveStep(null);
    setPinnedStep(null);
  }

  function togglePinnedStep(index: number) {
    if (pinnedStep === index) {
      setPinnedStep(null);
      setActiveStep(null);
      return;
    }

    setPinnedStep(index);
  }

  return (
    <GlassCard
      className={cn(
        "relative min-w-0 overflow-visible p-5",
        compact ? "lg:p-6" : "p-6 md:p-8",
      )}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          clearPreview();
        }
      }}
    >
      <div className="flex min-w-0 items-center justify-between gap-4 border-b border-[color:var(--field-border)] pb-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Example workflow preview
          </p>
          <h3 className="mt-2 text-lg font-semibold text-foreground">
            Lead handling system
          </h3>
        </div>
        <span className="rounded-full border border-success/30 bg-[var(--success-panel-bg)] px-3 py-1 text-xs font-medium text-success">
          Controlled
        </span>
      </div>

      <ol className="relative mt-5 space-y-3">
        {workflowSteps.map((step, index) => {
          const isVisible = visibleStep === index;
          const detailId = `workflow-step-${index + 1}-details`;
          const opensUp = index >= workflowSteps.length - 2;

          return (
            <li
              key={step.title}
              className={cn(
                "relative grid grid-cols-[1.5rem_1fr] gap-3",
                isVisible ? "z-50" : "z-0",
              )}
              onMouseEnter={() => setActiveStep(index)}
              onMouseLeave={() => {
                setActiveStep(null);
                setPinnedStep(null);
              }}
            >
              <div className="flex flex-col items-center">
                {index === 0 ? (
                  <CircleDot
                    className={cn(
                      "mt-1 size-4 transition-colors",
                      isVisible ? "text-primary" : "text-muted-foreground",
                    )}
                  />
                ) : (
                  <CheckCircle2
                    className={cn(
                      "mt-1 size-4 transition-colors",
                      isVisible ? "text-primary" : "text-success",
                    )}
                  />
                )}
                {index < workflowSteps.length - 1 ? (
                  <ArrowDown
                    className={cn(
                      "mt-2 size-3 transition-colors",
                      isVisible ? "text-primary/80" : "text-muted-foreground",
                    )}
                  />
                ) : null}
              </div>

              <div className="relative min-w-0">
                <button
                  type="button"
                  className={cn(
                    "w-full rounded-md border border-[color:var(--field-border)] bg-[var(--field-bg)] px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isVisible &&
                      "relative z-20 rounded-b-none border-[color:var(--island-active-border)] bg-[var(--island-active-bg)] shadow-md shadow-accent-strong/10",
                    isVisible &&
                      opensUp &&
                      "md:rounded-b-md md:rounded-t-none",
                  )}
                  aria-expanded={isVisible}
                  aria-controls={detailId}
                  onClick={() => togglePinnedStep(index)}
                  onFocus={() => setActiveStep(index)}
                  onBlur={() => setActiveStep(null)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p
                        className={cn(
                          "text-sm font-medium transition-colors",
                          isVisible ? "text-primary" : "text-foreground",
                        )}
                      >
                        {step.title}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        {step.note}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 rounded-full border px-2 py-1 text-[0.65rem] font-medium transition-colors",
                        isVisible
                          ? "border-[color:var(--island-active-border)] bg-[var(--active-chip-bg)] text-accent-strong"
                          : "border-[color:var(--field-border)] text-muted-foreground",
                      )}
                    >
                      {step.label}
                    </span>
                  </div>
                </button>

                {isVisible ? (
                  <div
                    id={detailId}
                    role="region"
                    aria-label={`${step.title} details`}
                    className={cn(
                      "workflow-panel relative z-30 -mt-px rounded-b-md border-t-0 p-3 md:absolute md:left-0 md:right-0 md:z-50",
                      opensUp
                        ? "md:bottom-full md:mb-[-1px] md:mt-0 md:rounded-b-none md:rounded-t-md md:border-b-0 md:border-t"
                        : "md:top-full md:-mt-px md:rounded-b-md md:border-t-0",
                    )}
                  >
                    <div className="grid gap-2.5 text-xs leading-5 sm:grid-cols-2">
                      <WorkflowDetail title="Trigger" body={step.trigger} />
                      <WorkflowDetail
                        title="System action"
                        body={step.systemAction}
                      />
                      <WorkflowDetail title="Human control" body={step.control} />
                      <WorkflowDetail title="Result" body={step.result} />
                    </div>
                  </div>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </GlassCard>
  );
}

function WorkflowDetail({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-md border border-[color:var(--field-border)] bg-[var(--field-bg-muted)] p-3">
      <p className="font-semibold text-foreground">{title}</p>
      <p className="mt-1 text-muted-foreground">{body}</p>
    </div>
  );
}
