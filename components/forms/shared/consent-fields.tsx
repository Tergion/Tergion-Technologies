import Link from "next/link";
import type { UseFormRegisterReturn } from "react-hook-form";

import { FormFieldError } from "@/components/forms/shared/form-field-error";
import { Label } from "@/components/ui/label";

type ConsentFieldsProps = {
  idPrefix?: string;
  contactCopy: string;
  contactRegistration: UseFormRegisterReturn;
  privacyRegistration: UseFormRegisterReturn;
  smsRegistration: UseFormRegisterReturn;
  contactError?: string;
  privacyError?: string;
};

export function ConsentFields({
  idPrefix = "",
  contactCopy,
  contactRegistration,
  privacyRegistration,
  smsRegistration,
  contactError,
  privacyError,
}: ConsentFieldsProps) {
  const contactId = `${idPrefix}contactConsent`;
  const privacyId = `${idPrefix}privacyTermsConsent`;
  const smsId = `${idPrefix}smsConsent`;

  return (
    <div className="space-y-4">
      <div className="flex gap-3 rounded-lg border border-[color:var(--field-border)] bg-[var(--field-bg-muted)] p-3">
        <input
          id={contactId}
          type="checkbox"
          className="mt-1 size-4 shrink-0 rounded border-[color:var(--field-border)] bg-[var(--field-bg)] accent-[var(--island-active-border)]"
          aria-invalid={Boolean(contactError)}
          aria-describedby={`${contactId}-error`}
          {...contactRegistration}
        />
        <div className="space-y-1">
          <Label htmlFor={contactId}>{contactCopy}</Label>
          <FormFieldError id={`${contactId}-error`} message={contactError} />
        </div>
      </div>

      <div className="flex gap-3 rounded-lg border border-[color:var(--field-border)] bg-[var(--field-bg-muted)] p-3">
        <input
          id={privacyId}
          type="checkbox"
          className="mt-1 size-4 shrink-0 rounded border-[color:var(--field-border)] bg-[var(--field-bg)] accent-[var(--island-active-border)]"
          aria-invalid={Boolean(privacyError)}
          aria-describedby={`${privacyId}-error`}
          {...privacyRegistration}
        />
        <div className="space-y-1">
          <Label htmlFor={privacyId}>
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
          <FormFieldError id={`${privacyId}-error`} message={privacyError} />
        </div>
      </div>

      <div className="flex gap-3 rounded-lg border border-[color:var(--field-border)] bg-[var(--field-bg-muted)] p-3">
        <input
          id={smsId}
          type="checkbox"
          className="mt-1 size-4 shrink-0 rounded border-[color:var(--field-border)] bg-[var(--field-bg)] accent-[var(--island-active-border)]"
          {...smsRegistration}
        />
        <Label htmlFor={smsId} className="leading-5">
          I agree to receive text messages from Tergion Technologies about my
          request. Message and data rates may apply. Reply STOP to opt out.
        </Label>
      </div>
    </div>
  );
}
