import { describe, expect, it } from "vitest";

import { deriveAssessmentLeadId } from "@/features/leads/submission-id";

describe("assessment submission identity", () => {
  it("derives the same opaque lead ID for the same browser submission nonce", async () => {
    const nonce = "123e4567-e89b-42d3-a456-426614174000";
    const first = await deriveAssessmentLeadId(nonce);
    const retry = await deriveAssessmentLeadId(nonce);

    expect(retry).toBe(first);
    expect(first).toMatch(/^[0-9a-f]{64}$/);
  });

  it("derives different lead IDs for separate assessment sessions", async () => {
    const first = await deriveAssessmentLeadId(
      "123e4567-e89b-42d3-a456-426614174000",
    );
    const second = await deriveAssessmentLeadId(
      "123e4567-e89b-42d3-a456-426614174001",
    );

    expect(second).not.toBe(first);
  });
});
