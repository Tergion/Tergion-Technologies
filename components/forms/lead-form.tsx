"use client";

import { useCallback, useEffect, useState } from "react";
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
import { LeadFormStepPreferences } from "@/components/forms/lead-form-step-preferences";
import { LeadFormStepReview } from "@/components/forms/lead-form-step-review";
import { LeadSubmissionStatus } from "@/components/forms/lead-submission-status";
import {
  FormErrorAlert,
  formValidationAlertMessage,
  type FormErrorNotification,
} from "@/components/forms/shared/form-error-summary";
import type { TurnstileStatus } from "@/components/forms/turnstile-widget";
import { Button } from "@/components/ui/button";
import {
  leadSuccessMessage,
  quickRequestFormVersion,
} from "@/features/leads/lead.constants";
import {
  leadContactBasicsStepSchema,
  leadContactPreferencesStepSchema,
  leadReviewStepSchema,
  quickRequestSchema,
} from "@/features/leads/lead.schema";
import { submitLead } from "@/features/leads/lead-submit";
import type {
  QuickRequest,
  QuickRequestInput,
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
  "lastName",
  "businessName",
  "email",
  "phone",
  "preferredContactMethod",
  "schedulingPreference",
  "contactConsent",
  "privacyTermsConsent",
] satisfies Array<Path<QuickRequestInput>>;

const stepHeadings = [
  "Contact",
  "Contact Preferences",
  "Business Context",
  "Review and Consent",
] as const;

export function LeadForm({
  active,
  triggerSource,
}: {
  active: boolean;
  triggerSource: string;
}) {
  const [startedAt] = useState(() => Date.now());
  const [submissionId] = useState(() => crypto.randomUUID());
  const [step, setStep] = useState(0);
  const [formError, setFormError] =
    useState<FormErrorNotification | null>(null);
  const [successMessage, setSuccessMessage] = useState(leadSuccessMessage);
  const [submissionState, setSubmissionState] = useState<
    "idle" | "submitting" | "success"
  >("idle");
  const [turnstileStatus, setTurnstileStatus] =
    useState<TurnstileStatus>("loading");

  const form = useForm<QuickRequestInput, undefined, QuickRequest>({
    resolver: zodResolver(quickRequestSchema),
    defaultValues: {
      submissionType: "quick_request",
      formVersion: quickRequestFormVersion,
      submissionId,
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
      triggerSource,
    },
  });
  const [contactConsent, privacyTermsConsent] = useWatch({
    control: form.control,
    name: ["contactConsent", "privacyTermsConsent"],
  });
  const requiredConsentsAccepted = contactConsent && privacyTermsConsent;
  const turnstileReady =
    turnstileStatus === "ready" ||
    turnstileStatus === "development-bypass";
  const canSubmit = requiredConsentsAccepted && turnstileReady;

  const handleTurnstileStatusChange = useCallback(
    (status: TurnstileStatus) => {
      setTurnstileStatus(status);
    },
    [],
  );
  const clearFormError = useCallback(() => setFormError(null), []);
  const dismissFormError = useCallback((notificationId: string) => {
    setFormError((current) =>
      current?.id === notificationId ? null : current,
    );
  }, []);
  const showFormError = useCallback((message: string) => {
    setFormError({ id: crypto.randomUUID(), message });
  }, []);

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

  useEffect(() => {
    form.setValue("triggerSource", triggerSource);
  }, [form, triggerSource]);

  useEffect(() => {
    if (active) {
      return;
    }

    form.setValue("turnstileToken", "", {
      shouldDirty: false,
      shouldValidate: false,
    });
    const statusTimer = window.setTimeout(() => {
      clearFormError();
      setTurnstileStatus("loading");
    }, 0);

    return () => window.clearTimeout(statusTimer);
  }, [active, clearFormError, form]);

  function focusField(name?: Path<QuickRequestInput>) {
    if (!name) {
      return;
    }

    window.requestAnimationFrame(() => {
      form.setFocus(name);

      const idElement = document.getElementById(name);
      const radioElement = document.querySelector<HTMLElement>(
        `[name="${name}"]`,
      );
      const element = idElement ?? radioElement;
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      element?.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "center",
      });
    });
  }

  function focusFirstFieldError(errors: FieldErrors<QuickRequestInput>) {
    const fieldNames = Object.keys(errors);
    const firstOrderedField = leadFieldOrder.find((field) =>
      fieldNames.includes(field),
    );
    const firstField =
      firstOrderedField ??
      (fieldNames[0] as Path<QuickRequestInput> | undefined);

    focusField(firstField);
  }

  function setStepAndFocus(nextStep: number) {
    setStep(nextStep);
    window.requestAnimationFrame(() => {
      document.getElementById("quick-request-step-heading")?.focus();
    });
  }

  async function goNext() {
    clearFormError();
    form.clearErrors();

    if (step === 0) {
      const result = leadContactBasicsStepSchema.safeParse(form.getValues());

      if (!result.success) {
        const firstError = applyZodErrors(form.setError, result.error);
        showFormError(formValidationAlertMessage);
        focusField(firstError);
        return;
      }
    }

    if (step === 1) {
      const currentPhone = form.getValues("phone");
      const result = leadContactPreferencesStepSchema.safeParse(
        form.getValues(),
      );

      if (!result.success) {
        const firstError = applyZodErrors(form.setError, result.error);
        showFormError(formValidationAlertMessage);
        focusField(firstError);
        return;
      }

      if (result.data.phone !== currentPhone) {
        form.setValue("phone", result.data.phone ?? "", {
          shouldDirty: true,
          shouldValidate: false,
        });
      }
    }

    setStepAndFocus(Math.min(step + 1, 3));
  }

  function goBack() {
    clearFormError();
    form.clearErrors();
    setStepAndFocus(Math.max(step - 1, 0));
  }

  async function onSubmit(values: QuickRequest) {
    clearFormError();
    form.clearErrors();

    const reviewResult = leadReviewStepSchema.safeParse(values);

    if (!reviewResult.success) {
      const firstError = applyZodErrors(form.setError, reviewResult.error);
      showFormError(formValidationAlertMessage);
      focusField(firstError);
      return;
    }

    const finalPayload = {
      ...values,
      completionStartedAt: startedAt,
    };

    const parsed = quickRequestSchema.safeParse(finalPayload);

    if (!parsed.success) {
      const firstError = applyZodErrors(form.setError, parsed.error);
      showFormError(formValidationAlertMessage);
      focusField(firstError);
      return;
    }

    try {
      setSubmissionState("submitting");
      const result = await submitLead(parsed.data);
      setSuccessMessage(result.message || leadSuccessMessage);
      setSubmissionState("success");
    } catch {
      showFormError(
        "We could not submit the request right now. Please try again later.",
      );
      form.setValue("turnstileToken", "", {
        shouldDirty: true,
        shouldValidate: false,
      });
      setTurnstileStatus("loading");
      setSubmissionState("idle");
    }
  }

  if (submissionState !== "idle") {
    return (
      <LeadSubmissionStatus
        status={submissionState}
        message={successMessage}
      />
    );
  }

  return (
    <form
      className="relative flex h-full min-h-0 flex-1 flex-col bg-[var(--modal-bg)]"
      onSubmit={form.handleSubmit(onSubmit, (errors) => {
        showFormError(formValidationAlertMessage);
        focusFirstFieldError(errors);
      })}
    >
      <FormErrorAlert
        id="quick-request-form-error"
        notification={formError}
        onDismiss={dismissFormError}
      />
      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto bg-[var(--modal-bg)] px-5 py-5">
        <FormProgress
          step={step + 1}
          totalSteps={4}
          label="Quick request progress"
        />

        <h2
          id="quick-request-step-heading"
          tabIndex={-1}
          className="text-lg font-semibold text-foreground outline-none"
        >
          {stepHeadings[step]}
        </h2>

        {step === 0 ? <LeadFormStepContact form={form} /> : null}
        {step === 1 ? <LeadFormStepPreferences form={form} /> : null}
        {step === 2 ? <LeadFormStepContext form={form} /> : null}
        {step === 3 ? (
          <LeadFormStepReview
            form={form}
            active={active}
            onTurnstileStatusChange={handleTurnstileStatusChange}
          />
        ) : null}
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-[color:var(--field-border)] bg-[var(--modal-bg)] px-5 py-4 sm:flex-row sm:justify-between">
        <Button
          type="button"
          variant="outline"
          className="min-h-11 border-[color:var(--field-border)] bg-[var(--field-bg)]"
          onClick={goBack}
          disabled={step === 0}
        >
          Back
        </Button>

        {step < 3 ? (
          <Button type="button" className="min-h-11 px-5" onClick={goNext}>
            Continue
          </Button>
        ) : (
          <Button
            type="submit"
            className="min-h-11 px-5"
            disabled={!canSubmit}
          >
            Send a quick request
          </Button>
        )}
      </div>
    </form>
  );
}
