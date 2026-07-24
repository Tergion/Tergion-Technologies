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

import { AutomationAssessmentIntro } from "@/components/forms/automation-assessment-intro";
import { AutomationAssessmentStep } from "@/components/forms/automation-assessment-steps";
import { AssessmentProgress } from "@/components/forms/assessment-progress";
import { LeadSubmissionStatus } from "@/components/forms/lead-submission-status";
import {
  FormErrorAlert,
  formValidationAlertMessage,
  type FormErrorNotification,
} from "@/components/forms/shared/form-error-summary";
import type { TurnstileStatus } from "@/components/forms/turnstile-widget";
import { Button } from "@/components/ui/button";
import {
  automationAssessmentFormVersion,
  getAutomationAssessmentSuccessMessage,
} from "@/features/assessments/assessment.constants";
import {
  assessmentBusinessProfileStepSchema,
  assessmentContactPreferencesStepSchema,
  assessmentContactStepSchema,
  assessmentLeadIntakeStepSchema,
  assessmentNextStepSchema,
  assessmentResponseVisibilityStepSchema,
  assessmentSystemsChallengeStepSchema,
  automationAssessmentSchema,
} from "@/features/assessments/assessment.schema";
import type {
  AutomationAssessment,
  AutomationAssessmentInput,
} from "@/features/assessments/assessment.types";
import { submitLead } from "@/features/leads/lead-submit";

const stepHeadings = [
  "Contact",
  "Contact Preferences",
  "Business Profile",
  "Lead Intake",
  "Response and Visibility",
  "Systems and Challenge",
  "Next Step",
  "Review and Consent",
] as const;

const stepSchemas = [
  assessmentContactStepSchema,
  assessmentContactPreferencesStepSchema,
  assessmentBusinessProfileStepSchema,
  assessmentLeadIntakeStepSchema,
  assessmentResponseVisibilityStepSchema,
  assessmentSystemsChallengeStepSchema,
  assessmentNextStepSchema,
] as const;

const fieldStep: Partial<Record<Path<AutomationAssessmentInput>, number>> = {
  firstName: 0,
  lastName: 0,
  businessName: 0,
  email: 0,
  phone: 1,
  preferredContactMethod: 1,
  schedulingPreference: 1,
  industry: 2,
  monthlyLeadRange: 2,
  customerValueRange: 2,
  websiteInquiryProcess: 3,
  incomingCallOwner: 3,
  incomingCallOwnerOther: 3,
  missedCallProcess: 3,
  leadResponseTime: 4,
  quoteFollowUpProcess: 4,
  pipelineVisibility: 4,
  leadTrackingMethod: 5,
  biggestChallenge: 5,
  biggestChallengeOther: 5,
  assessmentFollowUpPreference: 6,
  additionalNotes: 6,
  contactConsent: 7,
  privacyTermsConsent: 7,
  smsConsent: 7,
};

const assessmentFieldOrder = Object.keys(fieldStep) as Array<
  Path<AutomationAssessmentInput>
>;

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
      setError(fieldPath, { type: "manual", message: issue.message });
    }
  }

  return firstField;
}

export function AutomationAssessmentForm({
  active,
  triggerSource,
}: {
  active: boolean;
  triggerSource: string;
}) {
  const [startedAt] = useState(() => Date.now());
  const [submissionNonce] = useState(() => crypto.randomUUID());
  const [introVisible, setIntroVisible] = useState(true);
  const [step, setStep] = useState(0);
  const [formError, setFormError] =
    useState<FormErrorNotification | null>(null);
  const [successMessage, setSuccessMessage] = useState(
    getAutomationAssessmentSuccessMessage("personalized-review"),
  );
  const [submissionState, setSubmissionState] = useState<
    "idle" | "submitting" | "success"
  >("idle");
  const [turnstileStatus, setTurnstileStatus] =
    useState<TurnstileStatus>("loading");

  const form = useForm<
    AutomationAssessmentInput,
    undefined,
    AutomationAssessment
  >({
    resolver: zodResolver(automationAssessmentSchema),
    defaultValues: {
      submissionType: "automation_assessment",
      formVersion: automationAssessmentFormVersion,
      submissionNonce,
      firstName: "",
      lastName: "",
      businessName: "",
      email: "",
      phone: "",
      schedulingPreference: "",
      industry: "",
      customerValueRange: "",
      websiteInquiryProcess: "",
      incomingCallOwnerOther: "",
      quoteFollowUpProcess: "",
      pipelineVisibility: "",
      leadTrackingMethod: "",
      biggestChallengeOther: "",
      additionalNotes: "",
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
      triggerSource,
      aiDisclosureSeen: true,
    },
  });
  const [contactConsent, privacyTermsConsent] = useWatch({
    control: form.control,
    name: ["contactConsent", "privacyTermsConsent"],
  });
  const turnstileReady =
    turnstileStatus === "ready" ||
    turnstileStatus === "development-bypass";
  const canSubmit =
    Boolean(contactConsent && privacyTermsConsent) && turnstileReady;

  const handleTurnstileStatusChange = useCallback(
    (status: TurnstileStatus) => setTurnstileStatus(status),
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

  function focusField(name?: Path<AutomationAssessmentInput>) {
    if (!name) return;

    window.requestAnimationFrame(() => {
      form.setFocus(name);
      const idElement = document.getElementById(`assessment-${name}`);
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

  function showAndFocusField(name?: Path<AutomationAssessmentInput>) {
    if (!name) return;

    const nextStep = fieldStep[name];
    if (nextStep !== undefined) setStep(nextStep);
    focusField(name);
  }

  function focusStepHeading() {
    window.requestAnimationFrame(() => {
      document.getElementById("assessment-step-heading")?.focus();
    });
  }

  function goToStep(nextStep: number) {
    setStep(nextStep);
    focusStepHeading();
  }

  function startAssessment() {
    setIntroVisible(false);
    focusStepHeading();
  }

  function goNext() {
    clearFormError();
    form.clearErrors();
    const result = stepSchemas[step].safeParse(form.getValues());

    if (!result.success) {
      showAndFocusField(applyZodErrors(form.setError, result.error));
      showFormError(formValidationAlertMessage);
      return;
    }

    goToStep(Math.min(step + 1, 7));
  }

  function goBack() {
    clearFormError();
    form.clearErrors();

    if (step === 0) {
      setIntroVisible(true);
      return;
    }

    goToStep(step - 1);
  }

  function focusFirstFieldError(errors: FieldErrors<AutomationAssessmentInput>) {
    const names = Object.keys(errors);
    const firstField = assessmentFieldOrder.find((field) =>
      names.includes(field),
    );
    showAndFocusField(
      firstField ?? (names[0] as Path<AutomationAssessmentInput> | undefined),
    );
  }

  async function onSubmit(values: AutomationAssessment) {
    clearFormError();
    const parsed = automationAssessmentSchema.safeParse({
      ...values,
      completionStartedAt: startedAt,
    });

    if (!parsed.success) {
      const firstError = applyZodErrors(form.setError, parsed.error);
      showFormError(formValidationAlertMessage);
      showAndFocusField(firstError);
      return;
    }

    try {
      setSubmissionState("submitting");
      const result = await submitLead(parsed.data);
      setSuccessMessage(
        result.message ||
          getAutomationAssessmentSuccessMessage(
            parsed.data.assessmentFollowUpPreference,
          ),
      );
      setSubmissionState("success");
    } catch {
      showFormError(
        "We could not submit the assessment right now. Please try again later.",
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
        successHeading="Assessment received"
        submittingHeading="Submitting your assessment"
      />
    );
  }

  if (introVisible) {
    return <AutomationAssessmentIntro onStart={startAssessment} />;
  }

  return (
    <form
      className="relative flex h-full min-h-0 flex-col bg-[var(--modal-bg)]"
      onSubmit={form.handleSubmit(onSubmit, (errors) => {
        showFormError(formValidationAlertMessage);
        focusFirstFieldError(errors);
      })}
    >
      <FormErrorAlert
        id="assessment-form-error"
        notification={formError}
        onDismiss={dismissFormError}
      />
      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto bg-[var(--modal-bg)] px-5 py-5">
        <AssessmentProgress step={step + 1} />
        <h2
          id="assessment-step-heading"
          tabIndex={-1}
          className="text-lg font-semibold text-foreground outline-none"
        >
          {stepHeadings[step]}
        </h2>
        <AutomationAssessmentStep
          step={step}
          form={form}
          active={active}
          onTurnstileStatusChange={handleTurnstileStatusChange}
        />
      </div>
      <div className="flex flex-col-reverse gap-3 border-t border-[color:var(--field-border)] bg-[var(--modal-bg)] px-5 py-4 sm:flex-row sm:justify-between">
        <Button
          type="button"
          variant="outline"
          className="min-h-11 border-[color:var(--field-border)] bg-[var(--field-bg)]"
          onClick={goBack}
        >
          Back
        </Button>
        {step < 7 ? (
          <Button type="button" className="min-h-11 px-5" onClick={goNext}>
            Continue
          </Button>
        ) : (
          <Button type="submit" className="min-h-11 px-5" disabled={!canSubmit}>
            Submit assessment
          </Button>
        )}
      </div>
    </form>
  );
}
