import { z } from "zod";

import {
  automationInterestOptions,
  requestPriorityOptions,
  usesCrmValues,
} from "@/features/leads/lead.constants";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .or(z.literal("").transform(() => undefined));

const requiredText = (label: string, max: number) =>
  z.string().trim().min(1, `${label} is required.`).max(max);

const optionalEnum = <T extends readonly [string, ...string[]]>(values: T) =>
  z
    .enum(values)
    .optional()
    .or(z.literal("").transform(() => undefined));

export const preferredContactMethodSchema = z.enum([
  "email",
  "phone",
  "text",
  "no-preference",
]);

export const leadBaseSchema = z.object({
  firstName: requiredText("First name", 80),
  lastName: optionalText(80),
  businessName: requiredText("Business name", 140),
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .email("Enter a valid email address.")
    .max(180),
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
  honeypot: optionalText(120),
  completionStartedAt: z.number().int().positive().optional(),
  turnstileToken: optionalText(2000),
  timezone: optionalText(80),
  utmSource: optionalText(120),
  utmMedium: optionalText(120),
  utmCampaign: optionalText(160),
  utmContent: optionalText(160),
  referrer: optionalText(500),
  landingPage: optionalText(500),
  aiDisclosureSeen: z.boolean().optional().default(true),
});

function addPhoneRequirement(
  data: Pick<
    z.infer<typeof leadBaseSchema>,
    "preferredContactMethod" | "phone"
  >,
  ctx: z.RefinementCtx,
) {
  if (
    (data.preferredContactMethod === "phone" ||
      data.preferredContactMethod === "text") &&
    !data.phone
  ) {
    ctx.addIssue({
      code: "custom",
      path: ["phone"],
      message: "Phone is required when phone or text is selected.",
    });
  }
}

export const leadContactStepSchema = leadBaseSchema
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
  .superRefine(addPhoneRequirement);

export const leadReviewStepSchema = leadBaseSchema
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

export const leadSubmissionSchema = leadBaseSchema.superRefine((data, ctx) => {
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
});
