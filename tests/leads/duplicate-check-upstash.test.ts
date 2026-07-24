import { beforeEach, describe, expect, it, vi } from "vitest";

const upstashMocks = vi.hoisted(() => ({
  runUpstashPipeline: vi.fn(),
}));

vi.mock("@/features/leads/upstash", () => upstashMocks);
vi.mock("@/lib/env", () => ({
  hasUpstashRedisConfig: () => true,
}));

import {
  acquireAssessmentSubmissionLease,
  checkDuplicateLead,
  isAssessmentGoHighLevelCompleted,
  isAssessmentSubmissionCompleted,
  markAssessmentGoHighLevelCompleted,
  markAssessmentSubmissionCompleted,
  releaseAssessmentSubmissionLease,
} from "@/features/leads/duplicate-check";

describe("Upstash-backed assessment duplicate tracking", () => {
  beforeEach(() => {
    upstashMocks.runUpstashPipeline.mockReset();
    upstashMocks.runUpstashPipeline.mockImplementation(
      async (commands: Array<Array<string | number>>) =>
        commands.map((command) => ({
          result:
            command[0] === "SET"
              ? "OK"
              : command[0] === "EXISTS"
                ? 0
                : 1,
        })),
    );
  });

  it("counts distinct assessment lead IDs with Redis sets", async () => {
    await expect(
      checkDuplicateLead(
        "automation_assessment",
        "assessment@example.com",
        "+15551234567",
        Date.UTC(2026, 6, 24),
        "assessment-lead-one",
      ),
    ).resolves.toMatchObject({ duplicateLikely: false });

    const commands = upstashMocks.runUpstashPipeline.mock.calls[0]?.[0] as
      | Array<Array<string | number>>
      | undefined;

    expect(commands?.filter(([command]) => command === "SADD")).toHaveLength(4);
    expect(commands?.filter(([command]) => command === "SCARD")).toHaveLength(4);
    expect(commands?.some(([command]) => command === "INCR")).toBe(false);
    expect(
      commands
        ?.filter(([command]) => command === "SADD")
        .every(([, , leadId]) => leadId === "assessment-lead-one"),
    ).toBe(true);
  });

  it("keeps Quick Request on its existing counter commands", async () => {
    await expect(
      checkDuplicateLead(
        "quick_request",
        "quick@example.com",
        undefined,
        Date.UTC(2026, 6, 24),
      ),
    ).resolves.toMatchObject({ duplicateLikely: false });

    const commands = upstashMocks.runUpstashPipeline.mock.calls[0]?.[0] as
      | Array<Array<string | number>>
      | undefined;

    expect(commands?.filter(([command]) => command === "INCR")).toHaveLength(2);
    expect(commands?.some(([command]) => command === "SADD")).toBe(false);
    expect(commands?.some(([command]) => command === "SCARD")).toBe(false);
  });

  it("writes a bounded completion marker after persistence succeeds", async () => {
    await markAssessmentSubmissionCompleted("assessment-lead-completed");

    expect(upstashMocks.runUpstashPipeline).toHaveBeenCalledWith([
      [
        "SET",
        "lead:submission:automation_assessment:v1:completed:assessment-lead-completed",
        "1",
        "EX",
        86_400,
      ],
    ]);
  });

  it("writes and reads the bounded GoHighLevel stage marker", async () => {
    await markAssessmentGoHighLevelCompleted(
      "assessment-lead-ghl-completed",
    );

    expect(upstashMocks.runUpstashPipeline).toHaveBeenCalledWith([
      [
        "SET",
        "lead:submission:automation_assessment:v1:gohighlevel-completed:assessment-lead-ghl-completed",
        "1",
        "EX",
        86_400,
      ],
    ]);

    upstashMocks.runUpstashPipeline.mockResolvedValueOnce([
      { result: 1 },
    ]);

    await expect(
      isAssessmentGoHighLevelCompleted(
        "assessment-lead-ghl-completed",
      ),
    ).resolves.toBe(true);
  });

  it("uses a bounded atomic lease for concurrent assessment processing", async () => {
    const lease = await acquireAssessmentSubmissionLease(
      "assessment-lead-processing",
    );

    expect(lease).toMatchObject({
      leadId: "assessment-lead-processing",
      backend: "upstash",
    });
    expect(upstashMocks.runUpstashPipeline).toHaveBeenCalledWith([
      [
        "SET",
        "lead:submission:automation_assessment:v1:processing:assessment-lead-processing",
        expect.any(String),
        "NX",
        "EX",
        300,
      ],
    ]);

    await releaseAssessmentSubmissionLease(lease!);

    expect(upstashMocks.runUpstashPipeline).toHaveBeenLastCalledWith([
      [
        "EVAL",
        expect.stringContaining("redis.call('get'"),
        1,
        "lead:submission:automation_assessment:v1:processing:assessment-lead-processing",
        lease?.token,
      ],
    ]);
  });

  it("does not claim an assessment lease already held by another request", async () => {
    upstashMocks.runUpstashPipeline.mockResolvedValueOnce([
      { result: null },
    ]);

    await expect(
      acquireAssessmentSubmissionLease(
        "assessment-lead-processing",
      ),
    ).resolves.toBeUndefined();
  });

  it("fails closed when the configured distributed lease is unavailable", async () => {
    upstashMocks.runUpstashPipeline.mockRejectedValueOnce(
      new Error("temporary Redis failure"),
    );

    await expect(
      acquireAssessmentSubmissionLease(
        "assessment-lead-processing",
      ),
    ).resolves.toBeUndefined();
  });

  it("fails closed when distributed completion lookups are unavailable", async () => {
    upstashMocks.runUpstashPipeline.mockRejectedValue(
      new Error("temporary Redis failure"),
    );

    await expect(
      isAssessmentSubmissionCompleted("assessment-lead-completed"),
    ).rejects.toThrow("assessment-completion-state-unavailable");
    await expect(
      isAssessmentGoHighLevelCompleted(
        "assessment-lead-ghl-completed",
      ),
    ).rejects.toThrow("assessment-gohighlevel-state-unavailable");
  });

  it("rejects invalid distributed completion values", async () => {
    upstashMocks.runUpstashPipeline.mockResolvedValue([{ result: "1" }]);

    await expect(
      isAssessmentSubmissionCompleted("assessment-lead-completed"),
    ).rejects.toThrow("assessment-completion-state-unavailable");
    await expect(
      isAssessmentGoHighLevelCompleted(
        "assessment-lead-ghl-completed",
      ),
    ).rejects.toThrow("assessment-gohighlevel-state-unavailable");
  });

  it("fails closed when distributed completion markers cannot be written", async () => {
    upstashMocks.runUpstashPipeline.mockRejectedValue(
      new Error("temporary Redis failure"),
    );

    await expect(
      markAssessmentSubmissionCompleted(
        "assessment-lead-completed",
      ),
    ).rejects.toThrow("assessment-completion-marker-unavailable");
    await expect(
      markAssessmentGoHighLevelCompleted(
        "assessment-lead-ghl-completed",
      ),
    ).rejects.toThrow("assessment-gohighlevel-marker-unavailable");
  });
});
