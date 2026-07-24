import { beforeEach, describe, expect, it, vi } from "vitest";

const upstashMocks = vi.hoisted(() => ({
  runUpstashPipeline: vi.fn(),
}));

vi.mock("@/features/leads/upstash", () => upstashMocks);
vi.mock("@/lib/env", () => ({
  hasUpstashRedisConfig: () => true,
}));

import {
  commitGoHighLevelSubmission,
  isGoHighLevelSubmissionCompleted,
  markLeadSubmissionCompleted,
  releaseLeadSubmission,
  reserveLeadSubmission,
} from "@/features/leads/duplicate-check";

describe("Upstash-backed submission reservations", () => {
  beforeEach(() => {
    upstashMocks.runUpstashPipeline.mockReset();
  });

  it("atomically reserves hashed form-specific identity keys", async () => {
    upstashMocks.runUpstashPipeline.mockResolvedValue([
      { result: "reserved" },
    ]);

    const result = await reserveLeadSubmission(
      "quick_request",
      "quick-lead-one",
      "Test@Example.com",
      "+1 (555) 123-4567",
    );

    expect(result.status).toBe("reserved");
    const command = upstashMocks.runUpstashPipeline.mock.calls[0][0][0] as
      Array<string | number>;
    const serialized = JSON.stringify(command);

    expect(command[0]).toBe("EVAL");
    expect(serialized).toContain("lead:idempotency:quick_request:v2:");
    expect(serialized).toContain("lead:cooldown:quick_request:v1:email:");
    expect(serialized).toContain("lead:daily:quick_request:v1:phone:");
    expect(serialized).not.toContain("test@example.com");
    expect(serialized).not.toContain("15551234567");
  });

  it.each(["completed", "duplicate", "busy"] as const)(
    "returns the atomic %s reservation result",
    async (status) => {
      upstashMocks.runUpstashPipeline.mockResolvedValue([{ result: status }]);

      await expect(
        reserveLeadSubmission(
          "automation_assessment",
          "assessment-lead",
          "test@example.com",
        ),
      ).resolves.toEqual({ status });
    },
  );

  it("fails closed when configured Redis cannot reserve", async () => {
    upstashMocks.runUpstashPipeline.mockRejectedValue(
      new Error("redis-unavailable"),
    );

    await expect(
      reserveLeadSubmission(
        "quick_request",
        "quick-lead",
        "test@example.com",
      ),
    ).resolves.toEqual({ status: "unavailable" });
  });

  it("commits provider completion and contact cooldowns atomically", async () => {
    upstashMocks.runUpstashPipeline
      .mockResolvedValueOnce([{ result: "reserved" }])
      .mockResolvedValueOnce([{ result: 1 }]);
    const result = await reserveLeadSubmission(
      "automation_assessment",
      "assessment-lead",
      "test@example.com",
      "+15551234567",
    );

    expect(result.status).toBe("reserved");
    if (result.status !== "reserved") throw new Error("reservation missing");

    await commitGoHighLevelSubmission(result.reservation);
    const command = upstashMocks.runUpstashPipeline.mock.calls[1][0][0] as
      Array<string | number>;
    const serialized = JSON.stringify(command);

    expect(command[0]).toBe("EVAL");
    expect(serialized).toContain(
      "lead:idempotency:automation_assessment:v2:gohighlevel-completed:assessment-lead",
    );
    expect(serialized).toContain(
      "lead:cooldown:automation_assessment:v1:email:",
    );
  });

  it("releases only reservations owned by the current token", async () => {
    upstashMocks.runUpstashPipeline
      .mockResolvedValueOnce([{ result: "reserved" }])
      .mockResolvedValueOnce([{ result: 1 }]);
    const result = await reserveLeadSubmission(
      "quick_request",
      "quick-lead",
      "test@example.com",
    );

    if (result.status !== "reserved") throw new Error("reservation missing");
    await releaseLeadSubmission(result.reservation, {
      releaseIdentityReservation: true,
    });

    const command = upstashMocks.runUpstashPipeline.mock.calls[1][0][0] as
      Array<string | number>;
    expect(command[0]).toBe("EVAL");
    expect(JSON.stringify(command)).toContain("quick-lead");
  });

  it("reads provider state and writes form-specific completion markers", async () => {
    upstashMocks.runUpstashPipeline
      .mockResolvedValueOnce([{ result: 0 }])
      .mockResolvedValueOnce([{ result: "OK" }])
      .mockResolvedValueOnce([{ result: "completed" }]);

    await expect(
      isGoHighLevelSubmissionCompleted("quick_request", "quick-lead"),
    ).resolves.toBe(false);
    await markLeadSubmissionCompleted("quick_request", "quick-lead");
    await expect(
      reserveLeadSubmission(
        "quick_request",
        "quick-lead",
        "test@example.com",
      ),
    ).resolves.toEqual({ status: "completed" });

    expect(
      JSON.stringify(upstashMocks.runUpstashPipeline.mock.calls),
    ).toContain("lead:idempotency:quick_request:v2:");
  });
});
