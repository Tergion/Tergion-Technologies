"use client";

import Link from "next/link";
import type { UseFormReturn } from "react-hook-form";

import type {
  LeadSubmission,
  LeadSubmissionInput,
} from "@/features/leads/lead.types";
import { Label } from "@/components/ui/label";
import { TurnstileWidget } from "@/components/forms/turnstile-widget";

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

export function LeadFormStepReview({ form }: LeadFormStepProps) {
  const {
    register,
    watch,
    formState: { errors },
  } = form;
  const values = watch();

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
        <h3 className="text-sm font-semibold text-foreground">
          Request summary
        </h3>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Name</dt>
            <dd className="font-medium text-foreground">
              {values.firstName} {values.lastName}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Business</dt>
            <dd className="font-medium text-foreground">
              {values.businessName}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Email</dt>
            <dd className="font-medium text-foreground">{values.email}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Preference</dt>
            <dd className="font-medium text-foreground">
              {values.preferredContactMethod}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-muted-foreground">Scheduling</dt>
            <dd className="font-medium text-foreground">
              {values.schedulingPreference}
            </dd>
          </div>
        </dl>
      </div>

      <div className="space-y-4">
        <div className="flex gap-3 rounded-lg border border-white/10 bg-white/[0.025] p-3">
          <input
            id="contactConsent"
            type="checkbox"
            className="mt-0.5 size-5 rounded border-white/20 bg-white/10 accent-cyan-300"
            aria-invalid={Boolean(errors.contactConsent)}
            aria-describedby="contactConsent-error"
            {...register("contactConsent")}
          />
          <div className="space-y-1">
            <Label htmlFor="contactConsent">
              I agree to be contacted by Tergion Technologies about my request.
            </Label>
            <FieldError
              id="contactConsent-error"
              message={errors.contactConsent?.message}
            />
          </div>
        </div>

        <div className="flex gap-3 rounded-lg border border-white/10 bg-white/[0.025] p-3">
          <input
            id="privacyTermsConsent"
            type="checkbox"
            className="mt-0.5 size-5 rounded border-white/20 bg-white/10 accent-cyan-300"
            aria-invalid={Boolean(errors.privacyTermsConsent)}
            aria-describedby="privacyTermsConsent-error"
            {...register("privacyTermsConsent")}
          />
          <div className="space-y-1">
            <Label htmlFor="privacyTermsConsent">
              I agree to the{" "}
              <Link href="/privacy" className="text-primary hover:text-foreground">
                Privacy Policy
              </Link>{" "}
              and{" "}
              <Link href="/terms" className="text-primary hover:text-foreground">
                Terms of Use
              </Link>
              .
            </Label>
            <FieldError
              id="privacyTermsConsent-error"
              message={errors.privacyTermsConsent?.message}
            />
          </div>
        </div>

        <div className="flex gap-3 rounded-lg border border-white/10 bg-white/[0.025] p-3">
          <input
            id="smsConsent"
            type="checkbox"
            className="mt-0.5 size-5 rounded border-white/20 bg-white/10 accent-cyan-300"
            {...register("smsConsent")}
          />
          <Label htmlFor="smsConsent" className="leading-5">
            I agree to receive text messages from Tergion Technologies about my
            request. Message and data rates may apply. I can opt out by replying
            STOP.
          </Label>
        </div>
      </div>

      <TurnstileWidget />

      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
        {...register("honeypot")}
      />
    </div>
  );
}
