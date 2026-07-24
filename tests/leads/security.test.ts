import { beforeEach, describe, expect, it } from "vitest";

import {
  checkDuplicateLead,
  resetDuplicateLeadMemoryForTests,
} from "@/features/leads/duplicate-check";
import {
  checkLeadRateLimit,
  resetLeadRateLimitMemoryForTests,
} from "@/features/leads/rate-limit";
import { checkLeadSpamSignals } from "@/features/leads/spam-check";
import {
  makeAssessmentSubmission,
  makeLeadSubmission,
} from "@/tests/fixtures/leads";

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

  it("checks assessment notes and conditional Other fields for spam content", () => {
    const url = "https://spam.example/";
    const result = checkLeadSpamSignals(
      makeAssessmentSubmission({
        additionalNotes: url,
        incomingCallOwner: "other",
        incomingCallOwnerOther: url,
        biggestChallenge: "other",
        biggestChallengeOther: url,
      }),
    );

    expect(result.reasons).toContain("too-many-note-urls");
  });
});

describe("lead rate limiting", () => {
  beforeEach(() => {
    resetLeadRateLimitMemoryForTests();
  });

  it("blocks the fourth request in the same hourly window", async () => {
    const now = Date.UTC(2026, 6, 10, 12);

    for (let i = 0; i < 3; i += 1) {
      await expect(
        checkLeadRateLimit(makeRequest(), now + i),
      ).resolves.toMatchObject({
        allowed: true,
      });
    }

    await expect(
      checkLeadRateLimit(makeRequest(), now + 3),
    ).resolves.toMatchObject({
      allowed: false,
      reason: "development-in-memory-rate-limit-hour",
    });
  });

  it("blocks the eleventh request in the same daily window", async () => {
    const now = Date.UTC(2026, 6, 10, 12);

    for (let i = 0; i < 10; i += 1) {
      const hourOffset = Math.floor(i / 3) * 60 * 60 * 1000;
      const secondOffset = (i % 3) * 1000;

      await expect(
        checkLeadRateLimit(makeRequest(), now + hourOffset + secondOffset),
      ).resolves.toMatchObject({
        allowed: true,
      });
    }

    await expect(
      checkLeadRateLimit(makeRequest(), now + 3 * 60 * 60 * 1000 + 1000),
    ).resolves.toMatchObject({
      allowed: false,
      reason: "development-in-memory-rate-limit-day",
    });
  });
});

describe("lead duplicate checks", () => {
  beforeEach(() => {
    resetDuplicateLeadMemoryForTests();
  });

  it("flags repeated emails within the duplicate cooldown", async () => {
    const now = Date.UTC(2026, 6, 10, 12);

    await expect(
      checkDuplicateLead("quick_request", "test@example.com", undefined, now),
    ).resolves.toMatchObject({
      duplicateLikely: false,
    });

    await expect(
      checkDuplicateLead("quick_request", " TEST@example.com ", undefined, now + 1),
    ).resolves.toMatchObject({
      duplicateLikely: true,
      reason: "email-submitted-too-recently",
    });
  });

  it("flags repeated phone numbers within the duplicate cooldown", async () => {
    const now = Date.UTC(2026, 6, 10, 12);

    await expect(
      checkDuplicateLead("quick_request", "one@example.com", "+1 (555) 123-4567", now),
    ).resolves.toMatchObject({
      duplicateLikely: false,
    });

    await expect(
      checkDuplicateLead("quick_request", "two@example.com", "15551234567", now + 1),
    ).resolves.toMatchObject({
      duplicateLikely: true,
      reason: "phone-submitted-too-recently",
    });
  });

  it("allows three submissions per email across cooldown windows and blocks the fourth daily duplicate", async () => {
    const now = Date.UTC(2026, 6, 10, 12);

    for (let i = 0; i < 3; i += 1) {
      await expect(
        checkDuplicateLead(
          "quick_request",
          "daily@example.com",
          undefined,
          now + i * 16 * 60 * 1000,
        ),
      ).resolves.toMatchObject({
        duplicateLikely: false,
      });
    }

    await expect(
      checkDuplicateLead("quick_request", "daily@example.com", undefined, now + 48 * 60 * 1000),
    ).resolves.toMatchObject({
      duplicateLikely: true,
      reason: "email-daily-limit",
    });
  });

  it("namespaces Quick Request and Automation Assessment duplicates", async () => {
    const now = Date.UTC(2026, 6, 10, 12);

    await expect(
      checkDuplicateLead("quick_request", "shared@example.com", undefined, now),
    ).resolves.toMatchObject({ duplicateLikely: false });
    await expect(
      checkDuplicateLead(
        "automation_assessment",
        "shared@example.com",
        undefined,
        now + 1,
      ),
    ).resolves.toMatchObject({ duplicateLikely: false });
    await expect(
      checkDuplicateLead(
        "automation_assessment",
        "shared@example.com",
        undefined,
        now + 2,
      ),
    ).resolves.toMatchObject({ duplicateLikely: true });
  });
});
