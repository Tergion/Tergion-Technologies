const assessmentLeadIdNamespace =
  "tergion:automation-assessment-submission:v1";

export async function deriveAssessmentLeadId(submissionNonce: string) {
  const input = new TextEncoder().encode(
    `${assessmentLeadIdNamespace}:${submissionNonce}`,
  );
  const digest = await crypto.subtle.digest("SHA-256", input);

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
