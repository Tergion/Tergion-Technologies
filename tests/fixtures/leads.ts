import type { LeadRecord, LeadSubmission } from "@/features/leads/lead.types";

export function makeLeadSubmission(
  overrides: Partial<LeadSubmission> = {},
): LeadSubmission {
  return {
    firstName: "Test",
    businessName: "Example Business",
    email: "test@example.com",
    preferredContactMethod: "email",
    schedulingPreference: "Weekdays after 5 PM",
    usesCrm: "not-sure",
    automationInterests: [],
    contactConsent: true,
    privacyTermsConsent: true,
    smsConsent: false,
    aiDisclosureSeen: true,
    completionStartedAt: Date.now() - 10_000,
    ...overrides,
  };
}

export function makeLeadRecord(overrides: Partial<LeadRecord> = {}): LeadRecord {
  return {
    ...makeLeadSubmission(),
    leadId: "lead-123",
    createdAt: "2026-07-10T00:00:00.000Z",
    status: "new",
    security: {
      turnstileVerified: false,
      turnstileConfigured: false,
      spamScore: 0,
      spamReasons: [],
      duplicateLikely: false,
    },
    ...overrides,
  };
}
