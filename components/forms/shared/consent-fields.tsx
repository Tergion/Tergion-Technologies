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
      <Label
        htmlFor={contactId}
        data-consent-card={contactId}
        className="action-button flex cursor-pointer items-start gap-3 rounded-lg border border-[color:var(--field-border)] bg-[var(--field-bg-muted)] p-3 transition-[background-color,border-color,box-shadow,transform] duration-200 hover:border-[color:var(--button-border-hover)] hover:bg-[var(--button-muted-hover)] active:translate-y-px has-[:checked]:border-[color:var(--island-active-border)] has-[:checked]:bg-[var(--island-active-bg)] has-[:checked]:hover:bg-[var(--button-active-hover)] has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-[var(--island-focus-ring)]"
      >
        <input
          id={contactId}
          type="checkbox"
          className="mt-1 size-4 shrink-0 rounded border-[color:var(--field-border)] bg-[var(--field-bg)] accent-[var(--island-active-border)]"
          aria-invalid={Boolean(contactError)}
          aria-describedby={`${contactId}-error`}
          {...contactRegistration}
        />
        <span className="space-y-1 leading-5">
          <span className="block">{contactCopy}</span>
          <FormFieldError
            as="span"
            id={`${contactId}-error`}
            message={contactError}
          />
        </span>
      </Label>

      <Label
        htmlFor={privacyId}
        data-consent-card={privacyId}
        className="action-button flex cursor-pointer items-start gap-3 rounded-lg border border-[color:var(--field-border)] bg-[var(--field-bg-muted)] p-3 transition-[background-color,border-color,box-shadow,transform] duration-200 hover:border-[color:var(--button-border-hover)] hover:bg-[var(--button-muted-hover)] active:translate-y-px has-[:checked]:border-[color:var(--island-active-border)] has-[:checked]:bg-[var(--island-active-bg)] has-[:checked]:hover:bg-[var(--button-active-hover)] has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-[var(--island-focus-ring)]"
      >
        <input
          id={privacyId}
          type="checkbox"
          className="mt-1 size-4 shrink-0 rounded border-[color:var(--field-border)] bg-[var(--field-bg)] accent-[var(--island-active-border)]"
          aria-invalid={Boolean(privacyError)}
          aria-describedby={`${privacyId}-error`}
          {...privacyRegistration}
        />
        <span className="space-y-1 leading-5">
          <span className="block">
            I agree to the{" "}
            <Link href="/privacy" className="text-primary hover:text-foreground">
              Privacy Policy
            </Link>{" "}
            and{" "}
            <Link href="/terms" className="text-primary hover:text-foreground">
              Terms of Use
            </Link>
            , and I acknowledge the{" "}
            <Link
              href="/data-notice"
              className="text-primary hover:text-foreground"
            >
              Data Notice
            </Link>
            .
          </span>
          <FormFieldError
            as="span"
            id={`${privacyId}-error`}
            message={privacyError}
          />
        </span>
      </Label>

      <Label
        htmlFor={smsId}
        data-consent-card={smsId}
        className="action-button flex cursor-pointer items-start gap-3 rounded-lg border border-[color:var(--field-border)] bg-[var(--field-bg-muted)] p-3 leading-5 transition-[background-color,border-color,box-shadow,transform] duration-200 hover:border-[color:var(--button-border-hover)] hover:bg-[var(--button-muted-hover)] active:translate-y-px has-[:checked]:border-[color:var(--island-active-border)] has-[:checked]:bg-[var(--island-active-bg)] has-[:checked]:hover:bg-[var(--button-active-hover)] has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-[var(--island-focus-ring)]"
      >
        <input
          id={smsId}
          type="checkbox"
          className="mt-1 size-4 shrink-0 rounded border-[color:var(--field-border)] bg-[var(--field-bg)] accent-[var(--island-active-border)]"
          {...smsRegistration}
        />
        <span>
          I agree to receive text messages from Tergion Technologies about my
          request. Message and data rates may apply. Reply STOP to opt out.
        </span>
      </Label>
    </div>
  );
}
