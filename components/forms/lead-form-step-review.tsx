"use client";

import Link from "next/link";
import { useCallback } from "react";
import type { UseFormReturn } from "react-hook-form";

import {
  preferredContactMethods,
  usesCrmOptions,
} from "@/features/leads/lead.constants";
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
    setValue,
    watch,
    formState: { errors },
  } = form;
  const values = watch();
  const preferredContactLabel =
    preferredContactMethods.find(
      (method) => method.value === values.preferredContactMethod,
    )?.label ?? values.preferredContactMethod;
  const usesCrmLabel =
    usesCrmOptions.find((option) => option.value === values.usesCrm)?.label ??
    "Not sure";
  const interests = values.automationInterests ?? [];
  const handleTurnstileToken = useCallback(
    (token: string) => {
      setValue("turnstileToken", token, {
        shouldDirty: true,
        shouldValidate: false,
      });
    },
    [setValue],
  );

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-[color:var(--field-border)] bg-[var(--field-bg-muted)] p-4">
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
              {preferredContactLabel}
            </dd>
          </div>
          {values.phone ? (
            <div>
              <dt className="text-muted-foreground">Phone</dt>
              <dd className="font-medium text-foreground">{values.phone}</dd>
            </div>
          ) : null}
          <div className="sm:col-span-2">
            <dt className="text-muted-foreground">Scheduling</dt>
            <dd className="font-medium text-foreground">
              {values.schedulingPreference}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Uses CRM</dt>
            <dd className="font-medium text-foreground">{usesCrmLabel}</dd>
          </div>
          {values.currentCrm ? (
            <div>
              <dt className="text-muted-foreground">Current CRM</dt>
              <dd className="font-medium text-foreground">
                {values.currentCrm}
              </dd>
            </div>
          ) : null}
          {values.requestPriority ? (
            <div>
              <dt className="text-muted-foreground">Priority</dt>
              <dd className="font-medium text-foreground">
                {values.requestPriority}
              </dd>
            </div>
          ) : null}
          {interests.length ? (
            <div className="sm:col-span-2">
              <dt className="text-muted-foreground">Interests</dt>
              <dd className="font-medium text-foreground">
                {interests.join(", ")}
              </dd>
            </div>
          ) : null}
        </dl>
      </div>

      <div className="rounded-lg border border-[color:var(--field-border)] bg-[var(--field-bg-muted)] p-3 text-sm leading-6 text-muted-foreground">
        We collect the information you submit so we can respond to your request,
        evaluate your business automation needs, prevent spam, and improve our
        services. See our{" "}
        <Link href="/privacy" className="text-primary hover:text-foreground">
          Privacy Policy
        </Link>{" "}
        and{" "}
        <Link
          href="/data-notice"
          className="text-primary hover:text-foreground"
        >
          Data Notice
        </Link>
        .
      </div>

      <div className="space-y-4">
        <div className="flex gap-3 rounded-lg border border-[color:var(--field-border)] bg-[var(--field-bg-muted)] p-3">
          <input
            id="contactConsent"
            type="checkbox"
            className="mt-1 size-4 shrink-0 rounded border-[color:var(--field-border)] bg-[var(--field-bg)] accent-[var(--island-active-border)]"
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

        <div className="flex gap-3 rounded-lg border border-[color:var(--field-border)] bg-[var(--field-bg-muted)] p-3">
          <input
            id="privacyTermsConsent"
            type="checkbox"
            className="mt-1 size-4 shrink-0 rounded border-[color:var(--field-border)] bg-[var(--field-bg)] accent-[var(--island-active-border)]"
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

        <div className="flex gap-3 rounded-lg border border-[color:var(--field-border)] bg-[var(--field-bg-muted)] p-3">
          <input
            id="smsConsent"
            type="checkbox"
            className="mt-1 size-4 shrink-0 rounded border-[color:var(--field-border)] bg-[var(--field-bg)] accent-[var(--island-active-border)]"
            {...register("smsConsent")}
          />
          <Label htmlFor="smsConsent" className="leading-5">
            I agree to receive text messages from Tergion Technologies about my
            request. Message and data rates may apply. Reply STOP to opt out.
          </Label>
        </div>
      </div>

      <TurnstileWidget onToken={handleTurnstileToken} />

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
