import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

function setGoHighLevelEnv() {
  process.env.GHL_PRIVATE_INTEGRATION_TOKEN = "private-test-token";
  process.env.GHL_LOCATION_ID = "location-123";
}

function clearGoHighLevelEnv() {
  delete process.env.GHL_PRIVATE_INTEGRATION_TOKEN;
  delete process.env.GHL_LOCATION_ID;
}

describe("GoHighLevel request client", () => {
  beforeEach(() => {
    vi.resetModules();
    setGoHighLevelEnv();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    clearGoHighLevelEnv();
  });

  it("redacts authorization responses and credentials", async () => {
    const providerDetail = "private-contact@example.com";
    const errorLog = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const fetchMock = vi.fn(
      async (_input: RequestInfo | URL, _init?: RequestInit) => {
        void _input;
        void _init;

        return Response.json(
          { message: providerDetail },
          { status: 401 },
        );
      },
    );
    vi.stubGlobal("fetch", fetchMock);
    const {
      GoHighLevelRequestError,
      requestGoHighLevel,
    } = await import("@/features/leads/gohighlevel-client");

    const request = requestGoHighLevel({
      method: "POST",
      path: "/contacts/upsert",
      version: "v3",
      stage: "upsert-contact",
      leadId: "safe-correlation-id",
      body: {
        email: providerDetail,
      },
      expectedStatuses: [200],
      parseJson: true,
    });

    await expect(request).rejects.toMatchObject({
      name: "GoHighLevelRequestError",
      kind: "authorization",
      status: 401,
      stage: "upsert-contact",
    });

    try {
      await request;
    } catch (error) {
      expect(error).toBeInstanceOf(GoHighLevelRequestError);
      expect(JSON.stringify(error)).not.toContain(providerDetail);
      expect(JSON.stringify(error)).not.toContain("private-test-token");
    }

    expect(JSON.stringify(errorLog.mock.calls)).not.toContain(
      providerDetail,
    );
    expect(JSON.stringify(errorLog.mock.calls)).not.toContain(
      "private-test-token",
    );
    expect(errorLog).toHaveBeenCalledWith(
      "GoHighLevel lead sync failed",
      expect.objectContaining({
        provider: "gohighlevel",
        stage: "upsert-contact",
        status: 401,
        leadId: "safe-correlation-id",
      }),
    );
  });

  it("does not expose request data in validation failures", async () => {
    const privateRequestValue = "private-assessment-answer";
    const errorLog = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json(
          { message: `invalid ${privateRequestValue}` },
          { status: 400 },
        ),
      ),
    );
    const { requestGoHighLevel } = await import(
      "@/features/leads/gohighlevel-client"
    );

    await expect(
      requestGoHighLevel({
        method: "POST",
        path: "/objects/custom_objects.test/records",
        version: "v3",
        stage: "create-assessment-record",
        leadId: "safe-correlation-id",
        body: {
          properties: { additional_notes: privateRequestValue },
        },
        expectedStatuses: [201],
        parseJson: true,
      }),
    ).rejects.toMatchObject({
      kind: "http",
      status: 400,
    });
    expect(JSON.stringify(errorLog.mock.calls)).not.toContain(
      privateRequestValue,
    );
  });

  it("aborts a request after the bounded Worker-compatible timeout", async () => {
    vi.useFakeTimers();
    vi.spyOn(console, "error").mockImplementation(() => {});
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
    const { requestGoHighLevel } = await import(
      "@/features/leads/gohighlevel-client"
    );
    const pending = requestGoHighLevel({
      method: "POST",
      path: "/contacts/upsert",
      version: "v3",
      stage: "upsert-contact",
      leadId: "safe-correlation-id",
      body: { locationId: "location-123" },
      expectedStatuses: [200],
    });
    const assertion = expect(pending).rejects.toMatchObject({
      kind: "timeout",
    });

    await vi.advanceTimersByTimeAsync(6_000);
    await assertion;
  });

  it("keeps the timeout active and bounds retries while reading a response body", async () => {
    vi.useFakeTimers();
    vi.spyOn(console, "error").mockImplementation(() => {});
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
    const { requestGoHighLevel } = await import(
      "@/features/leads/gohighlevel-client"
    );
    const pending = requestGoHighLevel({
      method: "GET",
      path: "/objects/custom_objects.test",
      version: "v3",
      stage: "discover-assessment-schema",
      leadId: "safe-correlation-id",
      expectedStatuses: [200],
      parseJson: true,
      retrySafeRead: true,
    });
    const assertion = expect(pending).rejects.toMatchObject({
      kind: "timeout",
    });

    await vi.runAllTimersAsync();
    await assertion;
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it("does not retry before a Retry-After value beyond the bounded delay", async () => {
    vi.useFakeTimers();
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(Math, "random").mockReturnValue(0);
    const fetchMock = vi.fn(
      async () =>
        Response.json(
          { message: "rate limited" },
          {
            status: 429,
            headers: { "Retry-After": "120" },
          },
        ),
    );
    vi.stubGlobal("fetch", fetchMock);
    const { requestGoHighLevel } = await import(
      "@/features/leads/gohighlevel-client"
    );
    const pending = requestGoHighLevel({
      method: "GET",
      path: "/objects/custom_objects.test",
      version: "v3",
      stage: "discover-assessment-schema",
      leadId: "safe-correlation-id",
      expectedStatuses: [200],
      parseJson: true,
      retrySafeRead: true,
    });
    const assertion = expect(pending).rejects.toMatchObject({
      kind: "http",
      status: 429,
    });

    await assertion;
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("honors a Retry-After value within the bounded delay", async () => {
    vi.useFakeTimers();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        Response.json(
          { message: "rate limited" },
          {
            status: 429,
            headers: { "Retry-After": "1" },
          },
        ),
      )
      .mockResolvedValueOnce(Response.json({ object: {} }));
    vi.stubGlobal("fetch", fetchMock);
    const { requestGoHighLevel } = await import(
      "@/features/leads/gohighlevel-client"
    );
    const pending = requestGoHighLevel({
      method: "GET",
      path: "/objects/custom_objects.test",
      version: "v3",
      stage: "discover-assessment-schema",
      leadId: "safe-correlation-id",
      expectedStatuses: [200],
      parseJson: true,
      retrySafeRead: true,
    });

    await vi.advanceTimersByTimeAsync(999);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(1);
    await expect(pending).resolves.toEqual({ object: {} });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("never automatically retries a non-idempotent write", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const fetchMock = vi.fn(async () =>
      Response.json(
        { message: "temporarily unavailable" },
        { status: 503 },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);
    const { requestGoHighLevel } = await import(
      "@/features/leads/gohighlevel-client"
    );

    await expect(
      requestGoHighLevel({
        method: "POST",
        path: "/associations/relations",
        version: "v3",
        stage: "create-assessment-relation",
        leadId: "safe-correlation-id",
        body: { locationId: "location-123" },
        expectedStatuses: [201],
        parseJson: true,
      }),
    ).rejects.toMatchObject({ kind: "http", status: 503 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
