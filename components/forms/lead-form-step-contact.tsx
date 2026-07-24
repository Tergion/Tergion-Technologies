"use client";

import type { UseFormReturn } from "react-hook-form";

import { FormTextField } from "@/components/forms/shared/form-text-field";
import type {
  QuickRequest,
  QuickRequestInput,
} from "@/features/leads/lead.types";

type LeadFormStepProps = {
  form: UseFormReturn<QuickRequestInput, undefined, QuickRequest>;
};

export function LeadFormStepContact({ form }: LeadFormStepProps) {
  const {
    getFieldState,
    register,
    trigger,
    formState: { errors },
  } = form;

  function registerWithLiveValidation(
    name: "firstName" | "lastName" | "businessName" | "email",
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
      <fieldset className="space-y-3">
        <legend className="text-sm font-medium text-foreground">
          Full name
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormTextField
            id="firstName"
            label="First name *"
            autoComplete="given-name"
            registration={registerWithLiveValidation("firstName")}
            error={errors.firstName?.message}
          />
          <FormTextField
            id="lastName"
            label="Last name (optional)"
            autoComplete="family-name"
            registration={registerWithLiveValidation("lastName")}
            error={errors.lastName?.message}
          />
        </div>
      </fieldset>

      <FormTextField
        id="businessName"
        label="Business name *"
        autoComplete="organization"
        registration={registerWithLiveValidation("businessName")}
        error={errors.businessName?.message}
      />
      <FormTextField
        id="email"
        label="Email *"
        type="email"
        autoComplete="email"
        registration={registerWithLiveValidation("email")}
        error={errors.email?.message}
      />
    </div>
  );
}
