import { z } from "zod";

import {
  assessmentFollowUpPreferenceOptions,
  assessmentPreferredContactMethods,
  automationAssessmentFormVersion,
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
import {
  optionalEnum,
  optionalText,
  requiredEmail,
  requiredPhone,
  requiredText,
  submissionSecurityAndAttributionFields,
} from "@/features/leads/submission-fields";

function valuesOf<T extends readonly { value: string }[]>(options: T) {
  return options.map((option) => option.value) as [
    T[number]["value"],
    ...T[number]["value"][],
  ];
}

export const assessmentPreferredContactMethodSchema = z.enum(
  valuesOf(assessmentPreferredContactMethods),
);

export const automationAssessmentBaseSchema = z.object({
  submissionType: z.literal("automation_assessment"),
  formVersion: z.literal(automationAssessmentFormVersion),
  firstName: requiredText("First name", 80),
  lastName: optionalText(80),
  businessName: requiredText("Business name", 140),
  email: requiredEmail(180),
  phone: requiredPhone,
  preferredContactMethod: assessmentPreferredContactMethodSchema,
  schedulingPreference: optionalText(220),
  industry: requiredText("Industry", 120),
  monthlyLeadRange: z.enum(valuesOf(monthlyLeadRangeOptions), {
    error: "Monthly lead range is required.",
  }),
  customerValueRange: optionalEnum(valuesOf(customerValueRangeOptions)),
  websiteInquiryProcess: optionalEnum(valuesOf(websiteInquiryProcessOptions)),
  incomingCallOwner: z.enum(valuesOf(incomingCallOwnerOptions), {
    error: "Incoming call owner is required.",
  }),
  incomingCallOwnerOther: optionalText(120),
  missedCallProcess: z.enum(valuesOf(missedCallProcessOptions), {
    error: "Missed-call process is required.",
  }),
  leadResponseTime: z.enum(valuesOf(leadResponseTimeOptions), {
    error: "Lead response time is required.",
  }),
  quoteFollowUpProcess: optionalEnum(valuesOf(quoteFollowUpProcessOptions)),
  pipelineVisibility: optionalEnum(valuesOf(pipelineVisibilityOptions)),
  leadTrackingMethod: optionalEnum(valuesOf(leadTrackingMethodOptions)),
  biggestChallenge: z.enum(valuesOf(biggestChallengeOptions), {
    error: "Biggest challenge is required.",
  }),
  biggestChallengeOther: optionalText(120),
  assessmentFollowUpPreference: z.enum(
    valuesOf(assessmentFollowUpPreferenceOptions),
    { error: "Select how you would like us to follow up." },
  ),
  additionalNotes: optionalText(1200),
  contactConsent: z.boolean().default(false),
  privacyTermsConsent: z.boolean().default(false),
  smsConsent: z.boolean().optional().default(false),
  aiDisclosureSeen: z.boolean().optional().default(true),
  ...submissionSecurityAndAttributionFields,
});

function addConditionalOtherRequirements(
  data: Pick<
    z.infer<typeof automationAssessmentBaseSchema>,
    | "incomingCallOwner"
    | "incomingCallOwnerOther"
    | "biggestChallenge"
    | "biggestChallengeOther"
  >,
  ctx: z.RefinementCtx,
) {
  if (data.incomingCallOwner === "other" && !data.incomingCallOwnerOther) {
    ctx.addIssue({
      code: "custom",
      path: ["incomingCallOwnerOther"],
      message: "Tell us who typically answers incoming calls.",
    });
  }

  if (data.biggestChallenge === "other" && !data.biggestChallengeOther) {
    ctx.addIssue({
      code: "custom",
      path: ["biggestChallengeOther"],
      message: "Tell us about the challenge you selected.",
    });
  }
}

function addAssessmentConsentRequirements(
  data: Pick<
    z.infer<typeof automationAssessmentBaseSchema>,
    "contactConsent" | "privacyTermsConsent"
  >,
  ctx: z.RefinementCtx,
) {
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
}

export const automationAssessmentSchema = automationAssessmentBaseSchema.superRefine(
  (data, ctx) => {
    addConditionalOtherRequirements(data, ctx);
    addAssessmentConsentRequirements(data, ctx);
  },
);

export const assessmentContactStepSchema = automationAssessmentBaseSchema.pick({
  firstName: true,
  lastName: true,
  businessName: true,
  email: true,
});

export const assessmentContactPreferencesStepSchema =
  automationAssessmentBaseSchema.pick({
    phone: true,
    preferredContactMethod: true,
    schedulingPreference: true,
  });

export const assessmentBusinessProfileStepSchema =
  automationAssessmentBaseSchema.pick({
    industry: true,
    monthlyLeadRange: true,
    customerValueRange: true,
  });

export const assessmentLeadIntakeStepSchema = automationAssessmentBaseSchema
  .pick({
    websiteInquiryProcess: true,
    incomingCallOwner: true,
    incomingCallOwnerOther: true,
    missedCallProcess: true,
  })
  .superRefine((data, ctx) => {
    if (data.incomingCallOwner === "other" && !data.incomingCallOwnerOther) {
      ctx.addIssue({
        code: "custom",
        path: ["incomingCallOwnerOther"],
        message: "Tell us who typically answers incoming calls.",
      });
    }
  });

export const assessmentResponseVisibilityStepSchema =
  automationAssessmentBaseSchema.pick({
    leadResponseTime: true,
    quoteFollowUpProcess: true,
    pipelineVisibility: true,
  });

export const assessmentSystemsChallengeStepSchema = automationAssessmentBaseSchema
  .pick({
    leadTrackingMethod: true,
    biggestChallenge: true,
    biggestChallengeOther: true,
  })
  .superRefine((data, ctx) => {
    if (data.biggestChallenge === "other" && !data.biggestChallengeOther) {
      ctx.addIssue({
        code: "custom",
        path: ["biggestChallengeOther"],
        message: "Tell us about the challenge you selected.",
      });
    }
  });

export const assessmentNextStepSchema = automationAssessmentBaseSchema.pick({
  assessmentFollowUpPreference: true,
  additionalNotes: true,
});

export const assessmentReviewStepSchema = automationAssessmentBaseSchema
  .pick({
    contactConsent: true,
    privacyTermsConsent: true,
    smsConsent: true,
  })
  .superRefine(addAssessmentConsentRequirements);
