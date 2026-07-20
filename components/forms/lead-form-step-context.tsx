"use client";

import { useEffect } from "react";
import type { UseFormReturn } from "react-hook-form";

import {
  automationInterestOptions,
  requestPriorityOptions,
  usesCrmOptions,
} from "@/features/leads/lead.constants";
import type {
  LeadSubmission,
  LeadSubmissionInput,
} from "@/features/leads/lead.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type LeadFormStepProps = {
  form: UseFormReturn<LeadSubmissionInput, undefined, LeadSubmission>;
};

const inputClass =
  "h-11 border-[color:var(--field-border)] bg-[var(--field-bg)] text-foreground placeholder:text-muted-foreground";

export function LeadFormStepContext({ form }: LeadFormStepProps) {
  const { register, setValue, watch } = form;
  const interests = watch("automationInterests") ?? [];
  const usesCrm = watch("usesCrm") ?? "not-sure";
  const requestPriority = watch("requestPriority");

  useEffect(() => {
    if (usesCrm === "no") {
      setValue("currentCrm", "", {
        shouldDirty: true,
        shouldValidate: false,
      });
    }
  }, [setValue, usesCrm]);

  function toggleInterest(interest: (typeof automationInterestOptions)[number]) {
    const next = interests.includes(interest)
      ? interests.filter((item) => item !== interest)
      : [...interests, interest];

    setValue("automationInterests", next, {
      shouldDirty: true,
      shouldValidate: false,
    });
  }

  function selectPriority(priority: (typeof requestPriorityOptions)[number]) {
    setValue("requestPriority", requestPriority === priority ? "" : priority, {
      shouldDirty: true,
      shouldValidate: false,
    });
  }

  return (
    <div className="space-y-5">
      <p className="text-sm leading-6 text-muted-foreground">
        Add context only if it helps.
      </p>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-foreground">
          Do you use a CRM?
        </legend>
        <div className="grid grid-cols-3 gap-2">
          {usesCrmOptions.map((option) => {
            const selected = usesCrm === option.value;

            return (
              <button
                key={option.value}
                type="button"
                className={cn(
                  "action-button h-10 rounded-lg border px-3 text-sm font-medium transition-[color,background-color,border-color,box-shadow,transform] duration-200 active:translate-y-px focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[var(--island-focus-ring)] motion-reduce:hover:translate-y-0",
                  selected
                    ? "border-[color:var(--island-active-border)] bg-[var(--island-active-bg)] text-foreground hover:bg-[var(--button-active-hover)]"
                    : "border-[color:var(--field-border)] bg-[var(--field-bg-muted)] text-muted-foreground hover:border-[color:var(--button-border-hover)] hover:bg-[var(--button-muted-hover)] hover:text-foreground",
                )}
                aria-pressed={selected}
                onClick={() =>
                  setValue("usesCrm", option.value, {
                    shouldDirty: true,
                    shouldValidate: false,
                  })
                }
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      {usesCrm !== "no" ? (
        <div className="space-y-2">
          <Label htmlFor="currentCrm">Current CRM</Label>
          <Input
            id="currentCrm"
            placeholder="GoHighLevel, HubSpot, not sure, etc."
            className={inputClass}
            {...register("currentCrm")}
          />
        </div>
      ) : null}

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium text-foreground">
          Priority
        </legend>
        <div className="flex flex-wrap gap-2">
          {requestPriorityOptions.map((priority) => {
            const selected = requestPriority === priority;

            return (
              <Button
                key={priority}
                type="button"
                variant={selected ? "default" : "outline"}
                className={cn(
                  "h-9 border-[color:var(--field-border)] px-3",
                  !selected &&
                    "bg-[var(--field-bg-muted)] text-muted-foreground hover:bg-[var(--button-muted-hover)]",
                )}
                aria-pressed={selected}
                onClick={() => selectPriority(priority)}
              >
                {priority}
              </Button>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium text-foreground">
          What do you want help with?
        </legend>
        <div className="flex flex-wrap gap-2">
          {automationInterestOptions.map((interest) => {
            const selected = interests.includes(interest);

            return (
              <Button
                key={interest}
                type="button"
                variant={selected ? "default" : "outline"}
                className={cn(
                  "h-auto min-h-9 whitespace-normal border-[color:var(--field-border)] px-3 py-1.5",
                  !selected &&
                    "bg-[var(--field-bg-muted)] text-muted-foreground hover:bg-[var(--button-muted-hover)]",
                )}
                aria-pressed={selected}
                onClick={() => toggleInterest(interest)}
              >
                {interest}
              </Button>
            );
          })}
        </div>
      </fieldset>

      <details className="group rounded-lg border border-[color:var(--field-border)] bg-[var(--field-bg-muted)] p-4">
        <summary className="cursor-pointer text-sm font-semibold text-foreground outline-none focus-visible:ring-3 focus-visible:ring-[var(--island-focus-ring)]">
          Optional notes
        </summary>
        <div className="mt-4 space-y-2">
          <Label htmlFor="notes">Anything else we should know?</Label>
          <Textarea
            id="notes"
            rows={3}
            className="min-h-24 border-[color:var(--field-border)] bg-[var(--field-bg)] text-foreground placeholder:text-muted-foreground"
            placeholder="Add a short note if it helps explain the request."
            {...register("notes")}
          />
        </div>
      </details>
    </div>
  );
}
