import { hasGoogleSheetsConfig } from "@/lib/env";
import type { LeadRecord, ProviderResult } from "@/features/leads/lead.types";

export const googleSheetColumns = [
  "lead_id",
  "created_at",
  "status",
  "assigned_to",
  "first_name",
  "last_name",
  "business_name",
  "email",
  "phone",
  "website",
  "preferred_contact_method",
  "sms_consent",
  "email_consent",
  "industry",
  "business_size",
  "location",
  "service_area",
  "uses_crm",
  "current_crm",
  "request_priority",
  "monthly_lead_volume",
  "automation_interests",
  "timeline",
  "scheduling_preference",
  "timezone",
  "notes",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "referrer",
  "landing_page",
  "privacy_policy_accepted",
  "terms_accepted",
  "ai_disclosure_seen",
  "turnstile_verified",
  "spam_score",
  "internal_notes",
  "next_follow_up_at",
] as const;

export async function appendLeadToGoogleSheet(
  lead: LeadRecord,
): Promise<ProviderResult> {
  void lead;

  if (!hasGoogleSheetsConfig()) {
    return {
      ok: true,
      configured: false,
      provider: "google-sheets",
      message:
        "Development stub: Google Sheets credentials are not configured.",
    };
  }

  return {
    ok: true,
    configured: true,
    provider: "google-sheets",
    message:
      "Phase 1A stub: credentials are present, but live Sheets append is deferred.",
  };
}
