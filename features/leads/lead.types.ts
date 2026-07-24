import type { z } from "zod";

import type { AutomationAssessment } from "@/features/assessments/assessment.types";
import type {
  leadSubmissionUnionSchema,
  quickRequestSchema,
} from "@/features/leads/lead.schema";

export type QuickRequestInput = z.input<typeof quickRequestSchema>;
export type QuickRequest = z.output<typeof quickRequestSchema>;
export type LeadSubmissionInput = z.input<typeof leadSubmissionUnionSchema>;
export type LeadSubmission = z.output<typeof leadSubmissionUnionSchema>;

export type LeadSecuritySummary = {
  turnstileVerified: boolean;
  turnstileConfigured: boolean;
  spamScore: number;
  spamReasons: string[];
  rateLimitReason?: string;
  duplicateLikely: boolean;
  duplicateReason?: string;
};

type LeadRecordMetadata = {
  leadId: string;
  createdAt: string;
  status: "new";
  security: LeadSecuritySummary;
};

export type QuickRequestRecord = QuickRequest & LeadRecordMetadata;
export type AutomationAssessmentRecord = AutomationAssessment &
  LeadRecordMetadata;
export type LeadRecord = QuickRequestRecord | AutomationAssessmentRecord;

export type ProviderResult = {
  ok: boolean;
  configured: boolean;
  provider: string;
  message: string;
};
