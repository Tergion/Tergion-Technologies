"use client";

import { useEffect } from "react";
import type { UseFormReturn } from "react-hook-form";

import { FormChoiceGroup } from "@/components/forms/shared/form-choice-group";
import { FormTextField } from "@/components/forms/shared/form-text-field";
import { FormTextareaField } from "@/components/forms/shared/form-textarea-field";
import {
  automationInterestOptions,
  requestPriorityOptions,
  usesCrmOptions,
} from "@/features/leads/lead.constants";
import type {
  QuickRequest,
  QuickRequestInput,
} from "@/features/leads/lead.types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type LeadFormStepProps = {
  form: UseFormReturn<QuickRequestInput, undefined, QuickRequest>;
};

export function LeadFormStepContext({ form }: LeadFormStepProps) {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = form;
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
      <FormChoiceGroup<QuickRequestInput>
        name="usesCrm"
        legend="Do you use a CRM?"
        options={usesCrmOptions}
        register={register}
        columns={3}
      />

      {usesCrm !== "no" ? (
        <FormTextField
          id="currentCrm"
          label="Current CRM (optional)"
          placeholder="GoHighLevel, HubSpot, not sure, etc."
          registration={register("currentCrm")}
        />
      ) : null}

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium text-foreground">
          Priority
        </legend>
        <div className="grid gap-2 sm:grid-cols-4">
          {requestPriorityOptions.map((priority) => {
            const selected = requestPriority === priority;

            return (
              <Button
                key={priority}
                type="button"
                variant={selected ? "default" : "outline"}
                className={cn(
                  "h-auto min-h-11 whitespace-normal border-[color:var(--field-border)] px-3 py-2",
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
        <div className="grid gap-2 sm:grid-cols-2">
          {automationInterestOptions.map((interest) => {
            const selected = interests.includes(interest);

            return (
              <Button
                key={interest}
                type="button"
                variant={selected ? "default" : "outline"}
                className={cn(
                  "h-auto min-h-11 justify-start whitespace-normal border-[color:var(--field-border)] px-3 py-2 text-left",
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

      <FormTextareaField
        id="notes"
        label="Anything else we should know? (optional)"
        rows={3}
        maxLength={1200}
        className="min-h-24"
        placeholder="Add a short note if it helps explain the request."
        registration={register("notes")}
        error={errors.notes?.message}
      />
    </div>
  );
}
