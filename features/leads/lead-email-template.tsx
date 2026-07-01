import type { LeadRecord } from "@/features/leads/lead.types";

export function renderInternalLeadText(lead: LeadRecord) {
  const interests = lead.automationInterests?.join(", ") || "Not provided";

  return [
    `New Tergion Technologies request: ${lead.leadId}`,
    `Created: ${lead.createdAt}`,
    `Name: ${lead.firstName} ${lead.lastName ?? ""}`.trim(),
    `Business: ${lead.businessName}`,
    `Email: ${lead.email}`,
    `Phone: ${lead.phone ?? "Not provided"}`,
    `Preferred contact: ${lead.preferredContactMethod}`,
    `Scheduling preference: ${lead.schedulingPreference}`,
    `Website: ${lead.website ?? "Not provided"}`,
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

export function InternalLeadEmailTemplate({ lead }: { lead: LeadRecord }) {
  return (
    <div>
      <h1>New Tergion Technologies request</h1>
      <pre>{renderInternalLeadText(lead)}</pre>
    </div>
  );
}
