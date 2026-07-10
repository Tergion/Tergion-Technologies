import type { LeadSubmission } from "@/features/leads/lead.types";

type LeadSubmitResponse = {
  ok?: boolean;
  message?: string;
  leadId?: string;
};

export async function submitLead(payload: LeadSubmission) {
  const response = await fetch("/api/leads", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json().catch(() => null)) as
    | LeadSubmitResponse
    | null;

  if (!response.ok || !data?.ok) {
    throw new Error(data?.message || "Unable to submit the request.");
  }

  return data;
}
