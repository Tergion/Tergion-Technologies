import { hasEmailConfig } from "@/lib/env";
import { renderConfirmationEmailText } from "@/features/leads/confirmation-email-template";
import { renderInternalLeadText } from "@/features/leads/lead-email-template";
import type { LeadRecord, ProviderResult } from "@/features/leads/lead.types";

export async function sendInternalLeadNotification(
  lead: LeadRecord,
): Promise<ProviderResult> {
  const text = renderInternalLeadText(lead);
  void text;

  if (!hasEmailConfig()) {
    return {
      ok: true,
      configured: false,
      provider: "email",
      message:
        "Development stub: email provider credentials are not configured.",
    };
  }

  return {
    ok: true,
    configured: true,
    provider: "email",
    message:
      "Phase 1A stub: email provider config is present, but sending is deferred.",
  };
}

export async function sendLeadConfirmationEmail(
  lead: LeadRecord,
): Promise<ProviderResult> {
  const text = renderConfirmationEmailText(lead);
  void text;

  if (!hasEmailConfig()) {
    return {
      ok: true,
      configured: false,
      provider: "email",
      message:
        "Development stub: confirmation email provider credentials are not configured.",
    };
  }

  return {
    ok: true,
    configured: true,
    provider: "email",
    message:
      "Phase 1A stub: confirmation email provider config is present, but sending is deferred.",
  };
}
