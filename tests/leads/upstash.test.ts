import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

function setUpstashEnv() {
  process.env.UPSTASH_REDIS_REST_URL = "https://redis.example.test";
  process.env.UPSTASH_REDIS_REST_TOKEN = "private-test-token";
}

function clearUpstashEnv() {
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
}

describe("Upstash pipeline client", () => {
  beforeEach(() => {
    vi.resetModules();
    setUpstashEnv();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    clearUpstashEnv();
  });

  it("bounds a request that stalls before response headers", async () => {
    vi.useFakeTimers();
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async (_input: RequestInfo | URL, init?: RequestInit) =>
          new Promise<Response>((_resolve, reject) => {
            init?.signal?.addEventListener("abort", () => {
              reject(new DOMException("aborted", "AbortError"));
            });
          }),
      ),
    );
    const { runUpstashPipeline } = await import(
      "@/features/leads/upstash"
    );
    const pending = runUpstashPipeline([["EXISTS", "safe-key"]]);
    const assertion = expect(pending).rejects.toThrow(
      "upstash-unexpected-response",
    );

    await vi.advanceTimersByTimeAsync(3_000);
    await assertion;
  });

  it("keeps the timeout active while reading the response body", async () => {
    vi.useFakeTimers();
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async (_input: RequestInfo | URL, init?: RequestInit) =>
          new Response(
            new ReadableStream<Uint8Array>({
              start(controller) {
                init?.signal?.addEventListener("abort", () => {
                  controller.error(
                    new DOMException("aborted", "AbortError"),
                  );
                });
              },
            }),
            {
              status: 200,
              headers: { "Content-Type": "application/json" },
            },
          ),
      ),
    );
    const { runUpstashPipeline } = await import(
      "@/features/leads/upstash"
    );
    const pending = runUpstashPipeline([["EXISTS", "safe-key"]]);
    const assertion = expect(pending).rejects.toThrow(
      "upstash-unexpected-response",
    );

    await vi.advanceTimersByTimeAsync(3_000);
    await assertion;
  });

  it("requires a bounded JSON array response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response("not-json", {
          status: 200,
          headers: { "Content-Type": "text/plain" },
        }),
      ),
    );
    const { runUpstashPipeline } = await import(
      "@/features/leads/upstash"
    );

    await expect(
      runUpstashPipeline([["EXISTS", "safe-key"]]),
    ).rejects.toThrow("upstash-unexpected-response");
  });
});
