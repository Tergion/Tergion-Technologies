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
  "h-11 border-white/10 bg-white/[0.045] text-foreground placeholder:text-muted-foreground";

export function LeadFormStepContact({ form }: LeadFormStepProps) {
  const {
    register,
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

      <div className="grid gap-4 sm:grid-cols-2">
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
          <Label htmlFor="preferredContactMethod">
            Preferred contact method *
          </Label>
          <select
            id="preferredContactMethod"
            className={cn(
              inputClass,
              "w-full rounded-lg border px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
            )}
            aria-invalid={Boolean(errors.preferredContactMethod)}
            {...register("preferredContactMethod")}
          >
            {preferredContactMethods.map((method) => (
              <option key={method.value} value={method.value}>
                {method.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {phoneIsRequired ? (
        <div className="space-y-2 rounded-lg border border-primary/20 bg-primary/5 p-3">
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

      <div className="rounded-lg border border-white/10 bg-white/[0.025] p-4">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-foreground">
            Optional details
          </h3>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Add these only if they help us understand the business before
            following up.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="lastName">Last name</Label>
            <Input
              id="lastName"
              autoComplete="family-name"
              className={inputClass}
              {...register("lastName")}
            />
          </div>

          {!phoneIsRequired ? (
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                autoComplete="tel"
                className={inputClass}
                aria-invalid={Boolean(errors.phone)}
                aria-describedby={errors.phone ? "phone-error" : undefined}
                {...register("phone")}
              />
              <FieldError id="phone-error" message={errors.phone?.message} />
            </div>
          ) : null}

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              autoComplete="url"
              placeholder="https://example.com"
              className={inputClass}
              {...register("website")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
