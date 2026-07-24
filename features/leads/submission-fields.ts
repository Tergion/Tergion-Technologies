import { z } from "zod";

const phoneAllowedCharacters = /^[+\d\s().-]+$/;

export const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .or(z.literal("").transform(() => undefined));

export const requiredText = (label: string, max: number) =>
  z.string().trim().min(1, `${label} is required.`).max(max);

export const requiredEmail = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .superRefine((value, ctx) => {
      if (!value) {
        ctx.addIssue({
          code: "custom",
          message: "Email is required.",
        });
        return;
      }

      if (!z.email().safeParse(value).success) {
        ctx.addIssue({
          code: "custom",
          message: "Enter a valid email address.",
        });
      }
    })
    .transform((value) => value.toLowerCase());

function validatePhone(value: string, ctx: z.RefinementCtx) {
  if (!phoneAllowedCharacters.test(value)) {
    ctx.addIssue({
      code: "custom",
      message: "Enter a valid phone number.",
    });
    return;
  }

  const digitCount = value.replace(/\D/g, "").length;

  if (digitCount < 7 || digitCount > 15) {
    ctx.addIssue({
      code: "custom",
      message: "Enter a valid phone number.",
    });
  }
}

export const optionalPhone = z
  .string()
  .trim()
  .max(40)
  .superRefine((value, ctx) => {
    if (value) {
      validatePhone(value, ctx);
    }
  })
  .optional()
  .or(z.literal("").transform(() => undefined));

export const requiredPhone = z
  .string()
  .trim()
  .min(1, "Phone is required.")
  .max(40)
  .superRefine(validatePhone);

export const optionalEnum = <T extends readonly [string, ...string[]]>(
  values: T,
) =>
  z
    .enum(values)
    .optional()
    .or(z.literal("").transform(() => undefined));

export const submissionSecurityAndAttributionFields = {
  submissionId: z.uuid(),
  honeypot: optionalText(120),
  completionStartedAt: z.number().int().positive(),
  turnstileToken: optionalText(2000),
  timezone: optionalText(80),
  utmSource: optionalText(120),
  utmMedium: optionalText(120),
  utmCampaign: optionalText(160),
  utmContent: optionalText(160),
  referrer: optionalText(500),
  landingPage: optionalText(500),
  triggerSource: optionalText(120),
} as const;
