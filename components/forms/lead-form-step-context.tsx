"use client";

import type { UseFormReturn } from "react-hook-form";

import {
  automationInterestOptions,
  businessSizeOptions,
  timelineOptions,
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
  "h-11 border-white/10 bg-white/[0.045] text-foreground placeholder:text-muted-foreground";

export function LeadFormStepContext({ form }: LeadFormStepProps) {
  const { register, setValue, watch } = form;
  const interests = watch("automationInterests") ?? [];

  function toggleInterest(interest: (typeof automationInterestOptions)[number]) {
    const next = interests.includes(interest)
      ? interests.filter((item) => item !== interest)
      : [...interests, interest];

    setValue("automationInterests", next, {
      shouldDirty: true,
      shouldValidate: false,
    });
  }

  return (
    <div className="space-y-5">
      <p className="text-sm leading-6 text-muted-foreground">
        Business context is optional. Add only what helps explain the workflow
        you want to improve.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="industry">Industry</Label>
          <Input id="industry" className={inputClass} {...register("industry")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="businessSize">Business size</Label>
          <select
            id="businessSize"
            className={cn(
              inputClass,
              "w-full rounded-lg border px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
            )}
            {...register("businessSize")}
          >
            <option value="">Select if useful</option>
            {businessSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="locationOrServiceArea">
            Location or service area
          </Label>
          <Input
            id="locationOrServiceArea"
            className={inputClass}
            {...register("locationOrServiceArea")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="currentCrm">Current CRM</Label>
          <Input
            id="currentCrm"
            placeholder="None, HubSpot, GoHighLevel, etc."
            className={inputClass}
            {...register("currentCrm")}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="monthlyLeadVolume">Monthly lead volume</Label>
          <Input
            id="monthlyLeadVolume"
            placeholder="Approximate is fine"
            className={inputClass}
            {...register("monthlyLeadVolume")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="timeline">Timeline</Label>
          <select
            id="timeline"
            className={cn(
              inputClass,
              "w-full rounded-lg border px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
            )}
            {...register("timeline")}
          >
            <option value="">Select if useful</option>
            {timelineOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium text-foreground">
          Automation interests
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
                  "h-9 border-white/10 px-3",
                  !selected && "bg-white/[0.035] text-muted-foreground",
                )}
                onClick={() => toggleInterest(interest)}
              >
                {interest}
              </Button>
            );
          })}
        </div>
      </fieldset>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          rows={4}
          className="min-h-28 border-white/10 bg-white/[0.045] text-foreground placeholder:text-muted-foreground"
          placeholder="Anything we should understand before following up."
          {...register("notes")}
        />
      </div>
    </div>
  );
}
