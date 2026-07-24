import type { AutomationAssessment } from "@/features/assessments/assessment.types";
import type {
  AutomationAssessmentRecord,
  QuickRequest,
  QuickRequestRecord,
} from "@/features/leads/lead.types";

export function makeLeadSubmission(
  overrides: Partial<QuickRequest> = {},
): QuickRequest {
  return {
    submissionType: "quick_request",
    formVersion: "quick_request_v1",
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

export function makeLeadRecord(
  overrides: Partial<QuickRequestRecord> = {},
): QuickRequestRecord {
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

export function makeAssessmentSubmission(
  overrides: Partial<AutomationAssessment> = {},
): AutomationAssessment {
  return {
    submissionType: "automation_assessment",
    formVersion: "automation_assessment_v1",
    firstName: "Assessment",
    businessName: "Assessment Business",
    email: "assessment@example.com",
    phone: "+1 555 123 4567",
    preferredContactMethod: "email",
    industry: "Professional services",
    monthlyLeadRange: "20-to-50",
    incomingCallOwner: "owner",
    missedCallProcess: "manual-callback",
    leadResponseTime: "within-1-hour",
    biggestChallenge: "faster-follow-up",
    assessmentFollowUpPreference: "personalized-review",
    contactConsent: true,
    privacyTermsConsent: true,
    smsConsent: false,
    aiDisclosureSeen: true,
    completionStartedAt: Date.now() - 10_000,
    ...overrides,
  };
}

export function makeAssessmentRecord(
  overrides: Partial<AutomationAssessmentRecord> = {},
): AutomationAssessmentRecord {
  return {
    ...makeAssessmentSubmission(),
    leadId: "assessment-123",
    createdAt: "2026-07-22T00:00:00.000Z",
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
