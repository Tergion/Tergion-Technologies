import type { z } from "zod";

import type { leadSubmissionSchema } from "@/features/leads/lead.schema";

export type LeadSubmissionInput = z.input<typeof leadSubmissionSchema>;
export type LeadSubmission = z.output<typeof leadSubmissionSchema>;

export type LeadSecuritySummary = {
  turnstileVerified: boolean;
  turnstileConfigured: boolean;
  spamScore: number;
  spamReasons: string[];
  rateLimitReason?: string;
  duplicateLikely: boolean;
  duplicateReason?: string;
};

export type LeadRecord = LeadSubmission & {
  leadId: string;
  createdAt: string;
  status: "new";
  security: LeadSecuritySummary;
};

export type ProviderResult = {
  ok: boolean;
  configured: boolean;
  provider: string;
  message: string;
};
