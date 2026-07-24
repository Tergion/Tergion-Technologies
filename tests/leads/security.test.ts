import { beforeEach, describe, expect, it } from "vitest";

import {
  commitGoHighLevelSubmission,
  markLeadSubmissionCompleted,
  releaseLeadSubmission,
  reserveLeadSubmission,
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

  async function acceptSubmission(
    type: "quick_request" | "automation_assessment",
    leadId: string,
    email: string,
    phone: string | undefined,
    now: number,
  ) {
    const result = await reserveLeadSubmission(
      type,
      leadId,
      email,
      phone,
      now,
    );
    expect(result.status).toBe("reserved");
    if (result.status !== "reserved") throw new Error("reservation missing");
    await commitGoHighLevelSubmission(result.reservation, now);
    await releaseLeadSubmission(result.reservation, {
      releaseIdentityReservation: false,
    });
  }

  it("suppresses a different Quick Request email within the cooldown", async () => {
    const now = Date.UTC(2026, 6, 10, 12);

    await acceptSubmission(
      "quick_request",
      "quick-one",
      "test@example.com",
      undefined,
      now,
    );

    await expect(
      reserveLeadSubmission(
        "quick_request",
        "quick-two",
        " TEST@example.com ",
        undefined,
        now + 1,
      ),
    ).resolves.toEqual({ status: "duplicate" });
  });

  it("normalizes phone punctuation for contact cooldowns", async () => {
    const now = Date.UTC(2026, 6, 10, 12);

    await acceptSubmission(
      "quick_request",
      "quick-one",
      "one@example.com",
      "+1 (555) 123-4567",
      now,
    );

    await expect(
      reserveLeadSubmission(
        "quick_request",
        "quick-two",
        "two@example.com",
        "15551234567",
        now + 1,
      ),
    ).resolves.toEqual({ status: "duplicate" });
  });

  it("allows three committed events per day and blocks the fourth", async () => {
    const now = Date.UTC(2026, 6, 10, 12);

    for (let i = 0; i < 3; i += 1) {
      await acceptSubmission(
        "quick_request",
        `quick-${i}`,
        "daily@example.com",
        undefined,
        now + i * 16 * 60 * 1000,
      );
    }

    await expect(
      reserveLeadSubmission(
        "quick_request",
        "quick-four",
        "daily@example.com",
        undefined,
        now + 48 * 60 * 1000,
      ),
    ).resolves.toEqual({ status: "duplicate" });
  });

  it("allows the same identity to submit the other form", async () => {
    const now = Date.UTC(2026, 6, 10, 12);

    await acceptSubmission(
      "quick_request",
      "quick-one",
      "shared@example.com",
      undefined,
      now,
    );
    await expect(
      reserveLeadSubmission(
        "automation_assessment",
        "assessment-one",
        "shared@example.com",
        undefined,
        now + 1,
      ),
    ).resolves.toMatchObject({ status: "reserved" });
  });

  it("allows the same incomplete submission to resume without bypassing cooldowns", async () => {
    const now = Date.UTC(2026, 6, 10, 12);
    const first = await reserveLeadSubmission(
      "quick_request",
      "quick-one",
      "same@example.com",
      undefined,
      now,
    );
    if (first.status !== "reserved") throw new Error("reservation missing");
    await commitGoHighLevelSubmission(first.reservation, now);
    await releaseLeadSubmission(first.reservation, {
      releaseIdentityReservation: false,
    });

    const retry = await reserveLeadSubmission(
      "quick_request",
      "quick-one",
      "same@example.com",
      undefined,
      now + 1,
    );
    expect(retry.status).toBe("reserved");
  });

  it("releases contact cooldown reservations after definite provider failure", async () => {
    const now = Date.UTC(2026, 6, 10, 12);
    const first = await reserveLeadSubmission(
      "quick_request",
      "quick-one",
      "retry@example.com",
      undefined,
      now,
    );
    if (first.status !== "reserved") throw new Error("reservation missing");
    await releaseLeadSubmission(first.reservation, {
      releaseIdentityReservation: true,
    });

    await expect(
      reserveLeadSubmission(
        "quick_request",
        "quick-two",
        "retry@example.com",
        undefined,
        now + 1,
      ),
    ).resolves.toMatchObject({ status: "reserved" });
  });

  it("atomically allows only one simultaneous identical reservation", async () => {
    const now = Date.UTC(2026, 6, 10, 12);
    const results = await Promise.all([
      reserveLeadSubmission(
        "quick_request",
        "quick-same",
        "same@example.com",
        "+15551234567",
        now,
      ),
      reserveLeadSubmission(
        "quick_request",
        "quick-same",
        "same@example.com",
        "+1 (555) 123-4567",
        now,
      ),
    ]);

    expect(results.filter((result) => result.status === "reserved")).toHaveLength(
      1,
    );
    expect(results.filter((result) => result.status === "busy")).toHaveLength(1);
  });

  it("short-circuits a completed stable submission", async () => {
    const now = Date.UTC(2026, 6, 10, 12);
    const first = await reserveLeadSubmission(
      "automation_assessment",
      "assessment-one",
      "same@example.com",
      undefined,
      now,
    );
    if (first.status !== "reserved") throw new Error("reservation missing");
    await markLeadSubmissionCompleted(
      "automation_assessment",
      "assessment-one",
      now,
    );
    await releaseLeadSubmission(first.reservation, {
      releaseIdentityReservation: false,
    });

    await expect(
      reserveLeadSubmission(
        "automation_assessment",
        "assessment-one",
        "same@example.com",
        undefined,
        now + 1,
      ),
    ).resolves.toEqual({ status: "completed" });
  });
});
