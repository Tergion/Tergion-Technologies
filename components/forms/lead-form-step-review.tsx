"use client";

import Link from "next/link";
import { useCallback } from "react";
import type { UseFormReturn } from "react-hook-form";

import { ConsentFields } from "@/components/forms/shared/consent-fields";
import {
  SubmittedDetailList,
  type SubmittedDetail,
  type SubmittedDetailSection,
} from "@/components/forms/shared/submitted-detail-list";
import {
  preferredContactMethods,
  usesCrmOptions,
} from "@/features/leads/lead.constants";
import type {
  QuickRequest,
  QuickRequestInput,
} from "@/features/leads/lead.types";
import {
  TurnstileWidget,
  type TurnstileStatus,
} from "@/components/forms/turnstile-widget";

type LeadFormStepProps = {
  form: UseFormReturn<QuickRequestInput, undefined, QuickRequest>;
  active: boolean;
  onTurnstileStatusChange: (status: TurnstileStatus) => void;
};

function compactDetails(
  details: Array<SubmittedDetail | undefined>,
): SubmittedDetail[] {
  return details.filter(
    (detail): detail is SubmittedDetail => Boolean(detail?.value),
  );
}

export function LeadFormStepReview({
  form,
  active,
  onTurnstileStatusChange,
}: LeadFormStepProps) {
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
  const summarySections: SubmittedDetailSection[] = [
    {
      title: "Contact",
      details: compactDetails([
        {
          label: "Name",
          value: [values.firstName, values.lastName].filter(Boolean).join(" "),
        },
        { label: "Business", value: values.businessName ?? "" },
        { label: "Email", value: values.email ?? "" },
        values.phone
          ? { label: "Phone", value: values.phone }
          : undefined,
        { label: "Best way to reach you", value: preferredContactLabel },
        {
          label: "Scheduling preference",
          value: values.schedulingPreference ?? "",
        },
      ]),
    },
    {
      title: "Business Context",
      details: compactDetails([
        { label: "Uses CRM", value: usesCrmLabel },
        values.currentCrm
          ? { label: "Current CRM", value: values.currentCrm }
          : undefined,
        values.requestPriority
          ? { label: "Priority", value: values.requestPriority }
          : undefined,
        interests.length
          ? { label: "Interests", value: interests.join(", ") }
          : undefined,
        values.notes
          ? { label: "Notes", value: values.notes, multiline: true }
          : undefined,
      ]),
    },
  ];
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
      <SubmittedDetailList
        heading="Request summary"
        sections={summarySections}
      />

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

      <ConsentFields
        contactCopy="I agree to be contacted by Tergion Technologies about my request."
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
        id="honeypot"
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
