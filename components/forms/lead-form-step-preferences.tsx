"use client";

import { useEffect } from "react";
import type { UseFormReturn } from "react-hook-form";

import { FormChoiceGroup } from "@/components/forms/shared/form-choice-group";
import { FormTextField } from "@/components/forms/shared/form-text-field";
import { quickRequestPreferredContactMethods } from "@/features/leads/lead.constants";
import type {
  QuickRequest,
  QuickRequestInput,
} from "@/features/leads/lead.types";
import { requiredPhone } from "@/features/leads/submission-fields";

type LeadFormStepPreferencesProps = {
  form: UseFormReturn<QuickRequestInput, undefined, QuickRequest>;
};

export function LeadFormStepPreferences({
  form,
}: LeadFormStepPreferencesProps) {
  const {
    getFieldState,
    register,
    setValue,
    trigger,
    watch,
    formState: { errors },
  } = form;
  const preferredContactMethod = watch("preferredContactMethod");
  const phone = watch("phone") ?? "";
  const phoneIsValid = requiredPhone.safeParse(phone).success;
  const visibleContactMethods = quickRequestPreferredContactMethods.map(
    (method) => ({
      ...method,
      disabled: method.value === "phone" && !phoneIsValid,
    }),
  );

  useEffect(() => {
    if (preferredContactMethod === "phone" && !phoneIsValid) {
      setValue("preferredContactMethod", "email", {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }, [phoneIsValid, preferredContactMethod, setValue]);

  function registerWithLiveValidation(
    name: "schedulingPreference" | "phone",
  ) {
    const registration = register(name);

    return {
      ...registration,
      onChange: async (event: Parameters<typeof registration.onChange>[0]) => {
        await registration.onChange(event);

        if (getFieldState(name).error) {
          await trigger(name);
        }
      },
    };
  }

  return (
    <div className="space-y-5">
      <FormTextField
        id="phone"
        label="Phone (optional)"
        type="tel"
        autoComplete="tel"
        registration={registerWithLiveValidation("phone")}
        error={errors.phone?.message}
        helper="Add a valid phone number to make Phone available below."
      />

      <FormChoiceGroup<QuickRequestInput>
        name="preferredContactMethod"
        legend="Best way to reach you"
        options={visibleContactMethods}
        register={register}
        error={errors.preferredContactMethod?.message}
        required
        columns={3}
        helper="Phone is available after you enter a valid number above."
      />

      <FormTextField
        id="schedulingPreference"
        label="Scheduling preference *"
        placeholder="Weekday afternoons"
        registration={registerWithLiveValidation("schedulingPreference")}
        error={errors.schedulingPreference?.message}
        helper="Examples: Weekday afternoons; After 5 PM; Tuesday between 10 AM and noon; Email first."
      />
    </div>
  );
}
