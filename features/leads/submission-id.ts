import type { LeadSubmission } from "@/features/leads/lead.types";

const submissionLeadIdNamespace = "tergion:lead-submission:v2";

export async function deriveSubmissionLeadId(
  submissionType: LeadSubmission["submissionType"],
  submissionId: string,
) {
  const input = new TextEncoder().encode(
    `${submissionLeadIdNamespace}:${submissionType}:${submissionId}`,
  );
  const digest = await crypto.subtle.digest("SHA-256", input);

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function deriveAssessmentLeadId(submissionId: string) {
  return deriveSubmissionLeadId("automation_assessment", submissionId);
}
