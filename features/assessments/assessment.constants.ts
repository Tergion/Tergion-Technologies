export const automationAssessmentFormVersion = "automation_assessment_v1";

export const assessmentPreferredContactMethods = [
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "no-preference", label: "No preference" },
] as const;

export const monthlyLeadRangeOptions = [
  { value: "under-20", label: "Under 20" },
  { value: "20-to-50", label: "20–50" },
  { value: "50-to-100", label: "50–100" },
  { value: "over-100", label: "100+" },
] as const;

export const customerValueRangeOptions = [
  { value: "under-250", label: "Under $250" },
  { value: "250-to-1000", label: "$250–1,000" },
  { value: "1000-to-5000", label: "$1,000–5,000" },
  { value: "over-5000", label: "$5,000+" },
] as const;

export const websiteInquiryProcessOptions = [
  {
    value: "immediate-follow-up-system",
    label: "They immediately enter a follow-up system",
  },
  { value: "manual-contact", label: "Someone contacts them manually" },
  { value: "waits-in-inbox", label: "They sit in an inbox until someone checks" },
  { value: "no-automatic-action", label: "Nothing happens automatically" },
] as const;

export const incomingCallOwnerOptions = [
  { value: "owner", label: "Owner" },
  { value: "office-staff", label: "Office staff" },
  { value: "receptionist", label: "Receptionist" },
  { value: "answering-service", label: "Answering service" },
  { value: "other", label: "Other" },
] as const;

export const missedCallProcessOptions = [
  { value: "voicemail", label: "It goes to voicemail" },
  { value: "manual-callback", label: "We call them back later" },
  { value: "automatic-text", label: "They receive an automatic text message" },
  { value: "lead-often-lost", label: "We often lose the lead" },
] as const;

export const leadResponseTimeOptions = [
  { value: "within-5-minutes", label: "Within 5 minutes" },
  { value: "within-1-hour", label: "Within 1 hour" },
  { value: "same-day", label: "Same day" },
  { value: "next-day-or-later", label: "Next day or longer" },
] as const;

export const quoteFollowUpProcessOptions = [
  { value: "automatic-reminders", label: "Automatic reminders are sent" },
  { value: "manual-follow-up", label: "Someone follows up manually" },
  { value: "usually-nothing", label: "Usually nothing" },
  { value: "not-sure", label: "Not sure" },
] as const;

export const pipelineVisibilityOptions = [
  { value: "one-system", label: "Yes, everything is in one system" },
  { value: "spread-across-tools", label: "Mostly, but spread across multiple tools" },
  { value: "no-visibility", label: "No" },
  { value: "not-tracked", label: "We don’t really track it" },
] as const;

export const leadTrackingMethodOptions = [
  { value: "crm", label: "A CRM" },
  { value: "spreadsheets", label: "Spreadsheets" },
  { value: "notes-or-paper", label: "Notes or paper" },
  { value: "no-system", label: "We don’t have a system" },
] as const;

export const biggestChallengeOptions = [
  { value: "missed-calls", label: "Missing phone calls" },
  { value: "more-leads", label: "Getting more leads" },
  { value: "faster-follow-up", label: "Faster follow-up" },
  { value: "appointment-scheduling", label: "Scheduling appointments" },
  { value: "customer-communication", label: "Customer communication" },
  { value: "google-reviews", label: "Getting more Google reviews" },
  { value: "organization", label: "Staying organized" },
  { value: "administrative-work", label: "Reducing administrative work" },
  { value: "other", label: "Other" },
] as const;

export const assessmentFollowUpPreferenceOptions = [
  {
    value: "personalized-review",
    label: "Review my responses and contact me with recommendations",
  },
  {
    value: "information-first",
    label: "Send me more information first",
  },
  {
    value: "confirmation-only",
    label: "No follow-up beyond the confirmation email",
  },
] as const;

export const automationAssessmentTag = "automation-assessment";
export const assessmentConfirmationOnlyTag = "assessment-confirmation-only";

export const automationAssessmentDuplicateMessage =
  "We already received a recent automation assessment with this contact information. If you need to add something, email contact@tergion.com.";

export function getAutomationAssessmentSuccessMessage(
  preference: (typeof assessmentFollowUpPreferenceOptions)[number]["value"],
) {
  if (preference === "confirmation-only") {
    return "Thanks — we received your business automation assessment and recorded that you do not want additional follow-up beyond the confirmation email. No obligation. No pressure.";
  }

  if (preference === "information-first") {
    return "Thanks — we received your business automation assessment. We’ll review it and may provide introductory information before discussing a personalized review. No obligation. No pressure.";
  }

  return "Thanks — we received your business automation assessment. A person will review your responses and may follow up using the contact preference you selected. No obligation. No pressure.";
}
