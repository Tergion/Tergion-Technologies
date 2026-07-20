"use client";

import type { UseFormReturn } from "react-hook-form";

import {
  leadFormHelperCopy,
  preferredContactMethods,
} from "@/features/leads/lead.constants";
import type {
  LeadSubmission,
  LeadSubmissionInput,
} from "@/features/leads/lead.types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type LeadFormStepProps = {
  form: UseFormReturn<LeadSubmissionInput, undefined, LeadSubmission>;
};

function FieldError({ message, id }: { message?: string; id: string }) {
  if (!message) {
    return null;
  }

  return (
    <p id={id} className="text-xs font-medium text-destructive">
      {message}
    </p>
  );
}

const inputClass =
  "h-11 border-[color:var(--field-border)] bg-[var(--field-bg)] text-foreground placeholder:text-muted-foreground";

export function LeadFormStepContact({ form }: LeadFormStepProps) {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = form;
  const preferredContactMethod = watch("preferredContactMethod");
  const phoneIsRequired =
    preferredContactMethod === "phone" || preferredContactMethod === "text";

  return (
    <div className="space-y-5">
      <p className="text-sm leading-6 text-muted-foreground">
        {leadFormHelperCopy}
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName">First name *</Label>
          <Input
            id="firstName"
            autoComplete="given-name"
            className={inputClass}
            aria-invalid={Boolean(errors.firstName)}
            aria-describedby="firstName-error"
            {...register("firstName")}
          />
          <FieldError id="firstName-error" message={errors.firstName?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="businessName">Business name *</Label>
          <Input
            id="businessName"
            autoComplete="organization"
            className={inputClass}
            aria-invalid={Boolean(errors.businessName)}
            aria-describedby="businessName-error"
            {...register("businessName")}
          />
          <FieldError
            id="businessName-error"
            message={errors.businessName?.message}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          className={inputClass}
          aria-invalid={Boolean(errors.email)}
          aria-describedby="email-error"
          {...register("email")}
        />
        <FieldError id="email-error" message={errors.email?.message} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="schedulingPreference">Scheduling preference *</Label>
        <Input
          id="schedulingPreference"
          placeholder="Weekdays after 5 PM"
          className={inputClass}
          aria-invalid={Boolean(errors.schedulingPreference)}
          aria-describedby="schedulingPreference-error"
          {...register("schedulingPreference")}
        />
        <FieldError
          id="schedulingPreference-error"
          message={errors.schedulingPreference?.message}
        />
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-foreground">
          Preferred contact method *
        </legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {preferredContactMethods.map((method) => {
            const selected = preferredContactMethod === method.value;

            return (
              <button
                key={method.value}
                type="button"
                className={cn(
                  "action-button h-10 rounded-lg border px-3 text-sm font-medium transition-[color,background-color,border-color,box-shadow,transform] duration-200 active:translate-y-px focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[var(--island-focus-ring)] motion-reduce:hover:translate-y-0",
                  selected
                    ? "border-[color:var(--island-active-border)] bg-[var(--island-active-bg)] text-foreground hover:bg-[var(--button-active-hover)]"
                    : "border-[color:var(--field-border)] bg-[var(--field-bg-muted)] text-muted-foreground hover:border-[color:var(--button-border-hover)] hover:bg-[var(--button-muted-hover)] hover:text-foreground",
                )}
                aria-pressed={selected}
                onClick={() =>
                  setValue("preferredContactMethod", method.value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              >
                {method.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      {phoneIsRequired ? (
        <div className="space-y-2 rounded-lg border border-[color:var(--island-active-border)] bg-[var(--island-active-bg)] p-3">
          <Label htmlFor="phone">Phone *</Label>
          <Input
            id="phone"
            type="tel"
            autoComplete="tel"
            className={inputClass}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={cn("phone-helper", errors.phone && "phone-error")}
            {...register("phone")}
          />
          <p
            id="phone-helper"
            className="text-xs leading-5 text-muted-foreground"
          >
            Phone is needed when phone or text is selected as the preferred
            contact method.
          </p>
          <FieldError id="phone-error" message={errors.phone?.message} />
        </div>
      ) : null}
    </div>
  );
}
