import type { LeadRecord } from "@/features/leads/lead.types";

export const confirmationEmailSubject =
  "We received your Tergion Technologies request";

export function renderConfirmationEmailText(lead: LeadRecord) {
  void lead;

  return "Thanks for reaching out to Tergion Technologies. We received your request and will review your information before responding. We'll follow up based on your preferred contact method. No obligation, no pressure.";
}

export function ConfirmationEmailTemplate({ lead }: { lead: LeadRecord }) {
  return (
    <div>
      <p>{renderConfirmationEmailText(lead)}</p>
    </div>
  );
}
