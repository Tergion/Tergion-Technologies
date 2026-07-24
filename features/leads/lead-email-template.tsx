import {
  getAssessmentDetailSections,
  getAssessmentFollowUpPreferenceLabel,
} from "@/features/assessments/assessment-formatters";
import { preferredContactMethods } from "@/features/leads/lead.constants";
import type { LeadRecord } from "@/features/leads/lead.types";

const usesCrmLabels = {
  yes: "Yes",
  no: "No",
  "not-sure": "Not sure",
} as const;

function getPreferredContactLabel(value: string) {
  return (
    preferredContactMethods.find((method) => method.value === value)?.label ??
    value
  );
}

function renderQuickRequestText(
  lead: Extract<LeadRecord, { submissionType: "quick_request" }>,
) {
  const interests = lead.automationInterests?.join(", ") || "Not provided";

  return [
    `New Tergion Technologies request: ${lead.leadId}`,
    `Created: ${lead.createdAt}`,
    `Name: ${lead.firstName} ${lead.lastName ?? ""}`.trim(),
    `Business: ${lead.businessName}`,
    `Email: ${lead.email}`,
    `Phone: ${lead.phone ?? "Not provided"}`,
    `Preferred contact: ${getPreferredContactLabel(lead.preferredContactMethod)}`,
    `Scheduling preference: ${lead.schedulingPreference}`,
    `Website: ${lead.website ?? "Not provided"}`,
    `Uses CRM: ${usesCrmLabels[lead.usesCrm] ?? "Not sure"}`,
    `Current CRM: ${lead.currentCrm ?? "Not provided"}`,
    `Request priority: ${lead.requestPriority ?? "Not provided"}`,
    `Automation interests: ${interests}`,
    `Notes: ${lead.notes ?? "Not provided"}`,
    `Spam score: ${lead.security.spamScore}`,
    `Spam reasons: ${lead.security.spamReasons.join(", ") || "None"}`,
    `Turnstile configured: ${lead.security.turnstileConfigured}`,
    `Turnstile verified: ${lead.security.turnstileVerified}`,
    `Duplicate likely: ${lead.security.duplicateLikely}`,
    "Google Sheet link: configure GOOGLE_SHEETS_SPREADSHEET_ID to add a live destination.",
  ].join("\n");
}

function renderAssessmentText(
  lead: Extract<LeadRecord, { submissionType: "automation_assessment" }>,
) {
  return [
    `New Tergion Technologies automation assessment: ${lead.leadId}`,
    `Created: ${lead.createdAt}`,
    `Follow-up preference: ${getAssessmentFollowUpPreferenceLabel(lead)}`,
    ...getAssessmentDetailSections(lead).flatMap((section) => [
      "",
      section.title,
      ...section.details.map((detail) => `${detail.label}: ${detail.value}`),
    ]),
    "",
    `Contact consent: ${lead.contactConsent}`,
    `Privacy and terms consent: ${lead.privacyTermsConsent}`,
    `SMS consent: ${lead.smsConsent}`,
    `Spam score: ${lead.security.spamScore}`,
    `Spam reasons: ${lead.security.spamReasons.join(", ") || "None"}`,
  ].join("\n");
}

export function renderInternalLeadText(lead: LeadRecord) {
  return lead.submissionType === "automation_assessment"
    ? renderAssessmentText(lead)
    : renderQuickRequestText(lead);
}

export function InternalLeadEmailTemplate({ lead }: { lead: LeadRecord }) {
  return (
    <div>
      <h1>New Tergion Technologies request</h1>
      <pre>{renderInternalLeadText(lead)}</pre>
    </div>
  );
}
