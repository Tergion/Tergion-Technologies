"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import type {
  FieldErrors,
  FieldValues,
  Path,
  UseFormSetError,
} from "react-hook-form";
import { useForm, useWatch } from "react-hook-form";
import type { ZodError } from "zod";

import { FormProgress } from "@/components/forms/form-progress";
import { LeadFormStepContact } from "@/components/forms/lead-form-step-contact";
import { LeadFormStepContext } from "@/components/forms/lead-form-step-context";
import { LeadFormStepReview } from "@/components/forms/lead-form-step-review";
import { Button } from "@/components/ui/button";
import { leadSuccessMessage } from "@/features/leads/lead.constants";
import {
  leadContactStepSchema,
  leadReviewStepSchema,
  leadSubmissionSchema,
} from "@/features/leads/lead.schema";
import { submitLead } from "@/features/leads/lead-submit";
import type {
  LeadSubmission,
  LeadSubmissionInput,
} from "@/features/leads/lead.types";

function applyZodErrors<T extends FieldValues>(
  setError: UseFormSetError<T>,
  error: ZodError,
) {
  let firstField: Path<T> | undefined;

  for (const issue of error.issues) {
    const field = issue.path[0];

    if (typeof field === "string") {
      const fieldPath = field as Path<T>;

      firstField ??= fieldPath;
      setError(field as Path<T>, {
        type: "manual",
        message: issue.message,
      });
    }
  }

  return firstField;
}

const leadFieldOrder = [
  "firstName",
  "businessName",
  "email",
  "preferredContactMethod",
  "phone",
  "schedulingPreference",
  "contactConsent",
  "privacyTermsConsent",
] satisfies Array<Path<LeadSubmissionInput>>;

export function LeadForm() {
  const [startedAt] = useState(() => Date.now());
  const [step, setStep] = useState(0);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState(leadSuccessMessage);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<LeadSubmissionInput, undefined, LeadSubmission>({
    resolver: zodResolver(leadSubmissionSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      businessName: "",
      email: "",
      phone: "",
      website: "",
      preferredContactMethod: "email",
      schedulingPreference: "",
      industry: "",
      businessSize: "",
      locationOrServiceArea: "",
      usesCrm: "not-sure",
      currentCrm: "",
      automationInterests: [],
      requestPriority: "",
      notes: "",
      contactConsent: false,
      privacyTermsConsent: false,
      smsConsent: false,
      honeypot: "",
      completionStartedAt: startedAt,
      turnstileToken: "",
      timezone: "",
      utmSource: "",
      utmMedium: "",
      utmCampaign: "",
      utmContent: "",
      referrer: "",
      landingPage: "",
      aiDisclosureSeen: true,
    },
  });
  const [contactConsent, privacyTermsConsent] = useWatch({
    control: form.control,
    name: ["contactConsent", "privacyTermsConsent"],
  });
  const requiredConsentsAccepted = contactConsent && privacyTermsConsent;

  useEffect(() => {
    form.setValue(
      "timezone",
      Intl.DateTimeFormat().resolvedOptions().timeZone || "",
    );
    form.setValue("referrer", document.referrer || "");
    form.setValue("landingPage", window.location.href);
    const searchParams = new URLSearchParams(window.location.search);

    form.setValue("utmSource", searchParams.get("utm_source") || "");
    form.setValue("utmMedium", searchParams.get("utm_medium") || "");
    form.setValue("utmCampaign", searchParams.get("utm_campaign") || "");
    form.setValue("utmContent", searchParams.get("utm_content") || "");
  }, [form]);

  function focusField(name?: Path<LeadSubmissionInput>) {
    if (!name) {
      return;
    }

    window.requestAnimationFrame(() => {
      form.setFocus(name);

      const element = document.getElementById(name);
      element?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    });
  }

  function focusFirstFieldError(errors: FieldErrors<LeadSubmissionInput>) {
    const fieldNames = Object.keys(errors);
    const firstOrderedField = leadFieldOrder.find((field) =>
      fieldNames.includes(field),
    );
    const firstField =
      firstOrderedField ??
      (fieldNames[0] as Path<LeadSubmissionInput> | undefined);

    focusField(firstField);
  }

  async function goNext() {
    setFormError("");
    form.clearErrors();

    if (step === 0) {
      const result = leadContactStepSchema.safeParse(form.getValues());

      if (!result.success) {
        const firstError = applyZodErrors(form.setError, result.error);
        focusField(firstError);
        return;
      }
    }

    if (step === 1) {
      setStep(2);
      return;
    }

    setStep((current) => Math.min(current + 1, 2));
  }

  function goBack() {
    setFormError("");
    form.clearErrors();
    setStep((current) => Math.max(current - 1, 0));
  }

  async function onSubmit(values: LeadSubmission) {
    setFormError("");
    form.clearErrors();

    const reviewResult = leadReviewStepSchema.safeParse(values);

    if (!reviewResult.success) {
      const firstError = applyZodErrors(form.setError, reviewResult.error);
      focusField(firstError);
      return;
    }

    const finalPayload = {
      ...values,
      completionStartedAt: startedAt,
    };

    const parsed = leadSubmissionSchema.safeParse(finalPayload);

    if (!parsed.success) {
      const firstError = applyZodErrors(form.setError, parsed.error);
      setFormError("Please review the highlighted fields.");
      focusField(firstError);
      return;
    }

    try {
      setSubmitting(true);
      const result = await submitLead(parsed.data);
      setSuccessMessage(result.message || leadSuccessMessage);
      setSubmitted(true);
    } catch {
      setFormError(
        "We could not submit the request right now. Please try again later.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="m-5 rounded-lg border border-success/30 bg-[var(--success-panel-bg)] p-5">
        <h3 className="text-lg font-semibold text-foreground">
          Request received
        </h3>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          {successMessage}
        </p>
      </div>
    );
  }

  return (
    <form
      className="flex min-h-0 flex-1 flex-col bg-[var(--modal-bg)]"
      onSubmit={form.handleSubmit(onSubmit, (errors) => {
        setFormError("Please review the highlighted fields.");
        focusFirstFieldError(errors);
      })}
    >
      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto bg-[var(--modal-bg)] px-5 py-5">
        <FormProgress currentStep={step} />

        {step === 0 ? <LeadFormStepContact form={form} /> : null}
        {step === 1 ? <LeadFormStepContext form={form} /> : null}
        {step === 2 ? <LeadFormStepReview form={form} /> : null}

        {formError ? (
          <p className="rounded-md border border-destructive/30 bg-[#fbeeea] px-3 py-2 text-sm text-destructive">
            {formError}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-[color:var(--field-border)] bg-[var(--modal-bg)] px-5 py-4 sm:flex-row sm:justify-between">
        <Button
          type="button"
          variant="outline"
          className="h-11 border-[color:var(--field-border)] bg-[var(--field-bg)]"
          onClick={goBack}
          disabled={step === 0 || submitting}
        >
          Back
        </Button>

        {step < 2 ? (
          <Button type="button" className="h-11 px-5" onClick={goNext}>
            Continue
          </Button>
        ) : (
          <Button
            type="submit"
            className="h-11 px-5"
            disabled={submitting || !requiredConsentsAccepted}
          >
            {submitting ? "Submitting..." : "Start the request"}
          </Button>
        )}
      </div>
    </form>
  );
}
