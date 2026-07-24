"use client";

import { useCallback } from "react";
import type { UseFormReturn } from "react-hook-form";

import { AssessmentChoiceGroup } from "@/components/forms/assessment-choice-group";
import { ConsentFields } from "@/components/forms/shared/consent-fields";
import { FormTextField as TextField } from "@/components/forms/shared/form-text-field";
import { FormTextareaField } from "@/components/forms/shared/form-textarea-field";
import { SubmittedDetailList } from "@/components/forms/shared/submitted-detail-list";
import {
  TurnstileWidget,
  type TurnstileStatus,
} from "@/components/forms/turnstile-widget";
import {
  assessmentFollowUpPreferenceOptions,
  assessmentPreferredContactMethods,
  biggestChallengeOptions,
  customerValueRangeOptions,
  incomingCallOwnerOptions,
  leadResponseTimeOptions,
  leadTrackingMethodOptions,
  missedCallProcessOptions,
  monthlyLeadRangeOptions,
  pipelineVisibilityOptions,
  quoteFollowUpProcessOptions,
  websiteInquiryProcessOptions,
} from "@/features/assessments/assessment.constants";
import { getAssessmentDetailSections } from "@/features/assessments/assessment-formatters";
import { automationAssessmentBaseSchema } from "@/features/assessments/assessment.schema";
import type {
  AutomationAssessment,
  AutomationAssessmentInput,
} from "@/features/assessments/assessment.types";

type AssessmentForm = UseFormReturn<
  AutomationAssessmentInput,
  undefined,
  AutomationAssessment
>;

type AssessmentStepProps = {
  form: AssessmentForm;
  active: boolean;
  onTurnstileStatusChange: (status: TurnstileStatus) => void;
};

function ContactStep({ form }: { form: AssessmentForm }) {
  const { register, formState: { errors } } = form;

  return (
    <div className="space-y-5">
      <fieldset className="space-y-3">
        <legend className="text-sm font-medium text-foreground">Full name</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            id="assessment-firstName"
            label="First name *"
            autoComplete="given-name"
            registration={register("firstName")}
            error={errors.firstName?.message}
          />
          <TextField
            id="assessment-lastName"
            label="Last name (optional)"
            autoComplete="family-name"
            registration={register("lastName")}
            error={errors.lastName?.message}
          />
        </div>
      </fieldset>
      <TextField
        id="assessment-businessName"
        label="Business name *"
        autoComplete="organization"
        registration={register("businessName")}
        error={errors.businessName?.message}
      />
      <TextField
        id="assessment-email"
        label="Email *"
        type="email"
        autoComplete="email"
        registration={register("email")}
        error={errors.email?.message}
      />
    </div>
  );
}

function ContactPreferencesStep({ form }: { form: AssessmentForm }) {
  const { register, formState: { errors } } = form;

  return (
    <div className="space-y-5">
      <TextField
        id="assessment-phone"
        label="Phone *"
        type="tel"
        autoComplete="tel"
        registration={register("phone")}
        error={errors.phone?.message}
      />
      <AssessmentChoiceGroup
        name="preferredContactMethod"
        legend="Best way to reach you"
        options={assessmentPreferredContactMethods}
        register={register}
        error={errors.preferredContactMethod?.message}
        required
        columns={3}
      />
      <TextField
        id="assessment-schedulingPreference"
        label="Scheduling preference (optional)"
        placeholder="Weekday afternoons"
        registration={register("schedulingPreference")}
        error={errors.schedulingPreference?.message}
        helper="Examples: Weekday afternoons; After 5 PM; Tuesday between 10 AM and noon; Email first."
      />
    </div>
  );
}

function BusinessProfileStep({ form }: { form: AssessmentForm }) {
  const { register, formState: { errors } } = form;

  return (
    <div className="space-y-5">
      <TextField
        id="assessment-industry"
        label="Industry *"
        registration={register("industry")}
        error={errors.industry?.message}
      />
      <AssessmentChoiceGroup
        name="monthlyLeadRange"
        legend="Approximate monthly lead range"
        options={monthlyLeadRangeOptions}
        register={register}
        error={errors.monthlyLeadRange?.message}
        required
      />
      <AssessmentChoiceGroup
        name="customerValueRange"
        legend="Average customer value (optional)"
        options={customerValueRangeOptions}
        register={register}
        error={errors.customerValueRange?.message}
      />
    </div>
  );
}

function LeadIntakeStep({ form }: { form: AssessmentForm }) {
  const { register, watch, formState: { errors } } = form;
  const incomingCallOwner = watch("incomingCallOwner");

  return (
    <div className="space-y-5">
      <AssessmentChoiceGroup
        name="websiteInquiryProcess"
        legend="What usually happens after a website or message inquiry? (optional)"
        options={websiteInquiryProcessOptions}
        register={register}
        error={errors.websiteInquiryProcess?.message}
      />
      <AssessmentChoiceGroup
        name="incomingCallOwner"
        legend="Who usually answers incoming calls?"
        options={incomingCallOwnerOptions}
        register={register}
        error={errors.incomingCallOwner?.message}
        required
      />
      {incomingCallOwner === "other" ? (
        <TextField
          id="assessment-incomingCallOwnerOther"
          label="Who answers incoming calls? *"
          registration={register("incomingCallOwnerOther")}
          error={errors.incomingCallOwnerOther?.message}
        />
      ) : null}
      <AssessmentChoiceGroup
        name="missedCallProcess"
        legend="What usually happens when a call is missed?"
        options={missedCallProcessOptions}
        register={register}
        error={errors.missedCallProcess?.message}
        required
      />
    </div>
  );
}

function ResponseVisibilityStep({ form }: { form: AssessmentForm }) {
  const { register, formState: { errors } } = form;

  return (
    <div className="space-y-5">
      <AssessmentChoiceGroup
        name="leadResponseTime"
        legend="How quickly are new leads usually contacted?"
        options={leadResponseTimeOptions}
        register={register}
        error={errors.leadResponseTime?.message}
        required
      />
      <AssessmentChoiceGroup
        name="quoteFollowUpProcess"
        legend="What happens after a quote is sent? (optional)"
        options={quoteFollowUpProcessOptions}
        register={register}
        error={errors.quoteFollowUpProcess?.message}
      />
      <AssessmentChoiceGroup
        name="pipelineVisibility"
        legend="Can you easily see where each lead is in your process? (optional)"
        options={pipelineVisibilityOptions}
        register={register}
        error={errors.pipelineVisibility?.message}
      />
    </div>
  );
}

function SystemsChallengeStep({ form }: { form: AssessmentForm }) {
  const { register, watch, formState: { errors } } = form;
  const biggestChallenge = watch("biggestChallenge");

  return (
    <div className="space-y-5">
      <AssessmentChoiceGroup
        name="leadTrackingMethod"
        legend="How do you track leads and customers? (optional)"
        options={leadTrackingMethodOptions}
        register={register}
        error={errors.leadTrackingMethod?.message}
      />
      <AssessmentChoiceGroup
        name="biggestChallenge"
        legend="What is your biggest operational challenge right now?"
        options={biggestChallengeOptions}
        register={register}
        error={errors.biggestChallenge?.message}
        required
      />
      {biggestChallenge === "other" ? (
        <TextField
          id="assessment-biggestChallengeOther"
          label="Describe your biggest challenge *"
          registration={register("biggestChallengeOther")}
          error={errors.biggestChallengeOther?.message}
        />
      ) : null}
    </div>
  );
}

function NextStep({ form }: { form: AssessmentForm }) {
  const { register, formState: { errors } } = form;

  return (
    <div className="space-y-5">
      <AssessmentChoiceGroup
        name="assessmentFollowUpPreference"
        legend="How would you like us to follow up on your assessment?"
        options={assessmentFollowUpPreferenceOptions}
        register={register}
        error={errors.assessmentFollowUpPreference?.message}
        required
        columns={1}
      />
      <FormTextareaField
        id="assessment-additionalNotes"
        label="Additional notes (optional)"
        rows={5}
        maxLength={1200}
        className="min-h-28"
        placeholder="Add context that would help us understand your current process."
        helper="Do not submit passwords, customer records, financial account details, payment card details, health information, regulated data, or confidential third-party information."
        registration={register("additionalNotes")}
        error={errors.additionalNotes?.message}
      />
    </div>
  );
}

function ReviewStep({
  form,
  active,
  onTurnstileStatusChange,
}: AssessmentStepProps) {
  const { register, setValue, watch, formState: { errors } } = form;
  const parsedSummary = automationAssessmentBaseSchema.safeParse(watch());
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
      {parsedSummary.success ? (
        <SubmittedDetailList
          heading="Assessment answer summary"
          sections={getAssessmentDetailSections(parsedSummary.data)}
        />
      ) : (
        <p role="status" className="text-sm text-muted-foreground">
          Your answers will appear here after the required questions are complete.
        </p>
      )}
      <ConsentFields
        idPrefix="assessment-"
        contactCopy="I agree that Tergion Technologies may use the information I submitted and contact me according to the follow-up option I selected."
        contactRegistration={register("contactConsent")}
        privacyRegistration={register("privacyTermsConsent")}
        smsRegistration={register("smsConsent")}
        contactError={errors.contactConsent?.message}
        privacyError={errors.privacyTermsConsent?.message}
      />
      {active ? (
        <TurnstileWidget
          onToken={handleTurnstileToken}
          onStatusChange={onTurnstileStatusChange}
        />
      ) : null}
      <input
        id="assessment-honeypot"
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

export function AutomationAssessmentStep({
  step,
  form,
  active,
  onTurnstileStatusChange,
}: AssessmentStepProps & { step: number }) {
  if (step === 0) return <ContactStep form={form} />;
  if (step === 1) return <ContactPreferencesStep form={form} />;
  if (step === 2) return <BusinessProfileStep form={form} />;
  if (step === 3) return <LeadIntakeStep form={form} />;
  if (step === 4) return <ResponseVisibilityStep form={form} />;
  if (step === 5) return <SystemsChallengeStep form={form} />;
  if (step === 6) return <NextStep form={form} />;

  return (
    <ReviewStep
      form={form}
      active={active}
      onTurnstileStatusChange={onTurnstileStatusChange}
    />
  );
}
