import { beforeEach, describe, expect, it } from "vitest";

import { checkDuplicateLead, resetDuplicateLeadMemoryForTests } from "@/features/leads/duplicate-check";
import { checkLeadRateLimit, resetLeadRateLimitMemoryForTests } from "@/features/leads/rate-limit";
import { checkLeadSpamSignals } from "@/features/leads/spam-check";
import { makeLeadSubmission } from "@/tests/fixtures/leads";

function makeRequest(ip = "198.51.100.10") {
  return new Request("https://tergion.com/api/leads", {
    headers: {
      "user-agent": "vitest",
      "x-forwarded-for": ip,
    },
  });
}

describe("lead spam checks", () => {
  it("rejects honeypot submissions", () => {
    const result = checkLeadSpamSignals(
      makeLeadSubmission({ honeypot: "filled" }),
    );

    expect(result.passed).toBe(false);
    expect(result.reasons).toContain("honeypot-filled");
  });

  it("rejects submissions completed too quickly", () => {
    const result = checkLeadSpamSignals(
      makeLeadSubmission({ completionStartedAt: Date.now() }),
    );

    expect(result.passed).toBe(false);
    expect(result.reasons).toContain("completion-too-fast");
  });
});

describe("lead rate limiting", () => {
  beforeEach(() => {
    resetLeadRateLimitMemoryForTests();
  });

  it("blocks the sixth request in the same ten minute window", async () => {
    for (let i = 0; i < 5; i += 1) {
      await expect(checkLeadRateLimit(makeRequest())).resolves.toMatchObject({
        allowed: true,
      });
    }

    await expect(checkLeadRateLimit(makeRequest())).resolves.toMatchObject({
      allowed: false,
      reason: "development-in-memory-rate-limit",
    });
  });
});

describe("lead duplicate checks", () => {
  beforeEach(() => {
    resetDuplicateLeadMemoryForTests();
  });

  it("flags repeated emails within the duplicate window", async () => {
    await expect(checkDuplicateLead("test@example.com")).resolves.toMatchObject({
      duplicateLikely: false,
    });

    await expect(checkDuplicateLead(" TEST@example.com ")).resolves.toMatchObject({
      duplicateLikely: true,
      reason: "email-submitted-recently",
    });
  });

  it("flags repeated phone numbers within the duplicate window", async () => {
    await expect(
      checkDuplicateLead("one@example.com", "+15551234567"),
    ).resolves.toMatchObject({
      duplicateLikely: false,
    });

    await expect(
      checkDuplicateLead("two@example.com", "+15551234567"),
    ).resolves.toMatchObject({
      duplicateLikely: true,
      reason: "phone-submitted-recently",
    });
  });
});
