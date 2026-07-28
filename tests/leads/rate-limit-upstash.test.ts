import { beforeEach, describe, expect, it, vi } from "vitest";

const upstashMocks = vi.hoisted(() => ({
  runUpstashPipeline: vi.fn(),
}));

vi.mock("@/features/leads/upstash", () => upstashMocks);
vi.mock("@/lib/env", () => ({
  hasUpstashRedisConfig: () => true,
}));

import {
  checkLeadRateLimit,
  resetLeadRateLimitMemoryForTests,
} from "@/features/leads/rate-limit";

function makeRequest() {
  return new Request("https://tergion.com/api/leads", {
    headers: {
      "cf-connecting-ip": "198.51.100.25",
      "user-agent": "private-test-agent",
    },
  });
}

describe("Upstash-backed lead rate limiting", () => {
  beforeEach(() => {
    upstashMocks.runUpstashPipeline.mockReset();
    resetLeadRateLimitMemoryForTests();
  });

  it("uses versioned hashed keys and atomic fixed-window increments", async () => {
    upstashMocks.runUpstashPipeline.mockResolvedValue([
      { result: 1 },
      { result: 1 },
    ]);

    await expect(checkLeadRateLimit(makeRequest())).resolves.toEqual({
      allowed: true,
    });

    const commands = upstashMocks.runUpstashPipeline.mock.calls[0][0] as Array<
      Array<string | number>
    >;
    const serialized = JSON.stringify(commands);

    expect(commands).toHaveLength(2);
    expect(commands.every((command) => command[0] === "EVAL")).toBe(true);
    expect(serialized).toContain("lead:rate:v2:hour:");
    expect(serialized).toContain("lead:rate:v2:day:");
    expect(serialized).toContain("redis.call('ttl'");
    expect(serialized).not.toContain("198.51.100.25");
    expect(serialized).not.toContain("private-test-agent");
  });

  it("enforces positive integer Upstash counts", async () => {
    upstashMocks.runUpstashPipeline.mockResolvedValue([
      { result: 0 },
      { result: 1 },
    ]);

    for (let request = 0; request < 6; request += 1) {
      await expect(checkLeadRateLimit(makeRequest())).resolves.toEqual({
        allowed: true,
      });
    }

    await expect(checkLeadRateLimit(makeRequest())).resolves.toEqual({
      allowed: false,
      reason: "development-in-memory-rate-limit-hour",
    });
  });

  it("blocks counts above the configured production limit", async () => {
    upstashMocks.runUpstashPipeline.mockResolvedValue([
      { result: 7 },
      { result: 7 },
    ]);

    await expect(checkLeadRateLimit(makeRequest())).resolves.toEqual({
      allowed: false,
      reason: "upstash-rate-limit-hour",
    });
  });
});
