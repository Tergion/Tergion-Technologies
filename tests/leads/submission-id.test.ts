import { describe, expect, it } from "vitest";

import { deriveSubmissionLeadId } from "@/features/leads/submission-id";

describe("deriveSubmissionLeadId", () => {
  it("returns the same stable lead ID for the same form submission", async () => {
    const submissionId = "123e4567-e89b-42d3-a456-426614174000";
    const first = await deriveSubmissionLeadId(
      "automation_assessment",
      submissionId,
    );
    const retry = await deriveSubmissionLeadId(
      "automation_assessment",
      submissionId,
    );

    expect(retry).toBe(first);
    expect(first).toMatch(/^[a-f0-9]{64}$/);
  });

  it("namespaces Quick Request and Assessment identifiers", async () => {
    const submissionId = "123e4567-e89b-42d3-a456-426614174000";
    const quick = await deriveSubmissionLeadId(
      "quick_request",
      submissionId,
    );
    const assessment = await deriveSubmissionLeadId(
      "automation_assessment",
      submissionId,
    );

    expect(quick).not.toBe(assessment);
  });

  it("returns different lead IDs for different submission IDs", async () => {
    const first = await deriveSubmissionLeadId(
      "automation_assessment",
      "123e4567-e89b-42d3-a456-426614174000",
    );
    const second = await deriveSubmissionLeadId(
      "automation_assessment",
      "223e4567-e89b-42d3-a456-426614174000",
    );

    expect(first).not.toBe(second);
  });
});
