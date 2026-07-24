import { z } from "zod";

import { automationAssessmentSchema } from "@/features/assessments/assessment.schema";
import {
  automationInterestOptions,
  quickRequestFormVersion,
  requestPriorityOptions,
  usesCrmValues,
} from "@/features/leads/lead.constants";
import {
  optionalEnum,
  optionalText,
  requiredEmail,
  requiredPhone,
  requiredText,
  submissionSecurityAndAttributionFields,
} from "@/features/leads/submission-fields";

export const preferredContactMethodSchema = z.enum([
  "email",
  "phone",
  "text",
  "no-preference",
]);

export const quickRequestBaseSchema = z.object({
  submissionType: z.literal("quick_request"),
  formVersion: z.literal(quickRequestFormVersion),
  firstName: requiredText("First name", 80),
  lastName: optionalText(80),
  businessName: requiredText("Business name", 140),
  email: requiredEmail(180),
  phone: optionalText(40),
  website: optionalText(220),
  preferredContactMethod: preferredContactMethodSchema,
  schedulingPreference: requiredText("Scheduling preference", 220),
  industry: optionalText(120),
  businessSize: optionalText(80),
  locationOrServiceArea: optionalText(160),
  usesCrm: z.enum(usesCrmValues).optional().default("not-sure"),
  currentCrm: optionalText(120),
  automationInterests: z
    .array(z.enum(automationInterestOptions))
    .max(10)
    .optional()
    .default([]),
  requestPriority: optionalEnum(requestPriorityOptions),
  notes: optionalText(1200),
  contactConsent: z.boolean().default(false),
  privacyTermsConsent: z.boolean().default(false),
  smsConsent: z.boolean().optional().default(false),
  aiDisclosureSeen: z.boolean().optional().default(true),
  ...submissionSecurityAndAttributionFields,
});

type QuickRequestPhoneFields = Pick<
  z.infer<typeof quickRequestBaseSchema>,
  "preferredContactMethod" | "phone"
>;

function phoneIsRequired(data: QuickRequestPhoneFields) {
  return (
    data.preferredContactMethod === "phone" ||
    data.preferredContactMethod === "text"
  );
}

function phoneIsValid(phone: string | undefined) {
  return requiredPhone.safeParse(phone).success;
}

function addPhoneRequirement(
  data: QuickRequestPhoneFields,
  ctx: z.RefinementCtx,
) {
  if (!phoneIsRequired(data)) {
    return;
  }

  if (!data.phone) {
    ctx.addIssue({
      code: "custom",
      path: ["phone"],
      message: "Phone is required when phone or text is selected.",
    });
    return;
  }

  if (!phoneIsValid(data.phone)) {
    ctx.addIssue({
      code: "custom",
      path: ["phone"],
      message: "Enter a valid phone number.",
    });
  }
}

function discardInvalidOptionalPhone<T extends QuickRequestPhoneFields>(
  data: T,
) {
  if (!phoneIsRequired(data) && data.phone && !phoneIsValid(data.phone)) {
    return Object.assign({}, data, { phone: undefined });
  }

  return data;
}

export const leadContactStepSchema = quickRequestBaseSchema
  .pick({
    firstName: true,
    lastName: true,
    businessName: true,
    email: true,
    phone: true,
    website: true,
    preferredContactMethod: true,
    schedulingPreference: true,
  })
  .superRefine(addPhoneRequirement)
  .overwrite(discardInvalidOptionalPhone);

export const leadContactBasicsStepSchema = quickRequestBaseSchema.pick({
  firstName: true,
  lastName: true,
  businessName: true,
  email: true,
  website: true,
});

export const leadContactPreferencesStepSchema = quickRequestBaseSchema
  .pick({
    phone: true,
    preferredContactMethod: true,
    schedulingPreference: true,
  })
  .superRefine(addPhoneRequirement)
  .overwrite(discardInvalidOptionalPhone);

export const leadReviewStepSchema = quickRequestBaseSchema
  .pick({
    contactConsent: true,
    privacyTermsConsent: true,
    smsConsent: true,
  })
  .superRefine((data, ctx) => {
    if (!data.contactConsent) {
      ctx.addIssue({
        code: "custom",
        path: ["contactConsent"],
        message: "Contact consent is required.",
      });
    }

    if (!data.privacyTermsConsent) {
      ctx.addIssue({
        code: "custom",
        path: ["privacyTermsConsent"],
        message: "Privacy and terms consent is required.",
      });
    }
  });

export const quickRequestSchema = quickRequestBaseSchema.superRefine(
  (data, ctx) => {
    addPhoneRequirement(data, ctx);

    if (!data.contactConsent) {
      ctx.addIssue({
        code: "custom",
        path: ["contactConsent"],
        message: "Contact consent is required.",
      });
    }

    if (!data.privacyTermsConsent) {
      ctx.addIssue({
        code: "custom",
        path: ["privacyTermsConsent"],
        message: "Privacy and terms consent is required.",
      });
    }
  },
).overwrite(discardInvalidOptionalPhone);

export const leadSubmissionUnionSchema = z.discriminatedUnion(
  "submissionType",
  [quickRequestSchema, automationAssessmentSchema],
);

function preprocessLegacyQuickRequest(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return value;
  }

  const record = value as Record<string, unknown>;

  if (record.submissionType !== undefined) {
    return value;
  }

  return {
    ...record,
    submissionType: "quick_request",
    formVersion: record.formVersion ?? quickRequestFormVersion,
  };
}

export const leadSubmissionSchema = z.preprocess(
  preprocessLegacyQuickRequest,
  leadSubmissionUnionSchema,
);
