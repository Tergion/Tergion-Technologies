import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { makeLeadSubmission } from "@/tests/fixtures/leads";

function clearIntegrationEnv() {
  delete process.env.GHL_PRIVATE_INTEGRATION_TOKEN;
  delete process.env.GHL_API_KEY;
  delete process.env.GHL_LOCATION_ID;
  delete process.env.TURNSTILE_SECRET_KEY;
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
}

function setGoHighLevelEnv() {
  process.env.GHL_PRIVATE_INTEGRATION_TOKEN = "test-token";
  process.env.GHL_LOCATION_ID = "location-123";
}

async function importRoute() {
  const [{ POST }, duplicate, rateLimit] = await Promise.all([
    import("@/app/api/leads/route"),
    import("@/features/leads/duplicate-check"),
    import("@/features/leads/rate-limit"),
  ]);

  duplicate.resetDuplicateLeadMemoryForTests();
  rateLimit.resetLeadRateLimitMemoryForTests();

  return POST;
}

function makePostRequest(payload: unknown, ip = "203.0.113.10") {
  return new Request("https://tergion.com/api/leads", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "user-agent": "vitest",
      "x-forwarded-for": ip,
    },
    body: JSON.stringify(payload),
  });
}

function mockSuccessfulGoHighLevelFetch() {
  const fetchMock = vi.fn(
    async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url.endsWith("/contacts/upsert")) {
        return Response.json({ contact: { id: "contact-123" } });
      }

      if (
        url.endsWith("/contacts/contact-123/tags") ||
        url.endsWith("/contacts/contact-123/notes")
      ) {
        return Response.json({}, { status: 201 });
      }

      throw new Error(`Unexpected URL: ${url}`);
    },
  );

  vi.stubGlobal("fetch", fetchMock);

  return fetchMock;
}

describe("/api/leads", () => {
  beforeEach(() => {
    vi.resetModules();
    clearIntegrationEnv();
  });

  afterEach(() => {
    clearIntegrationEnv();
  });

  it("silently accepts honeypot spam without calling providers", async () => {
    setGoHighLevelEnv();
    const fetchMock = mockSuccessfulGoHighLevelFetch();
    const POST = await importRoute();
    const response = await POST(
      makePostRequest(makeLeadSubmission({ honeypot: "filled" })),
    );

    await expect(response.json()).resolves.toMatchObject({ ok: true });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("suppresses duplicate email submissions before calling GoHighLevel again", async () => {
    setGoHighLevelEnv();
    const fetchMock = mockSuccessfulGoHighLevelFetch();
    const POST = await importRoute();
    const first = await POST(makePostRequest(makeLeadSubmission()));
    const second = await POST(
      makePostRequest(
        makeLeadSubmission({
          email: " TEST@example.com ",
          phone: "+15550000000",
        }),
      ),
    );

    await expect(first.json()).resolves.toMatchObject({ ok: true });
    await expect(second.json()).resolves.toMatchObject({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("suppresses duplicate phone submissions before calling GoHighLevel again", async () => {
    setGoHighLevelEnv();
    const fetchMock = mockSuccessfulGoHighLevelFetch();
    const POST = await importRoute();
    const first = await POST(
      makePostRequest(
        makeLeadSubmission({
          email: "one@example.com",
          phone: "+15551234567",
        }),
      ),
    );
    const second = await POST(
      makePostRequest(
        makeLeadSubmission({
          email: "two@example.com",
          phone: "+15551234567",
        }),
      ),
    );

    await expect(first.json()).resolves.toMatchObject({ ok: true });
    await expect(second.json()).resolves.toMatchObject({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("blocks the sixth request from the same client signal", async () => {
    const POST = await importRoute();

    for (let i = 0; i < 5; i += 1) {
      const response = await POST(
        makePostRequest(
          makeLeadSubmission({ email: `rate-${i}@example.com` }),
          "203.0.113.20",
        ),
      );

      expect(response.status).toBe(200);
    }

    const blocked = await POST(
      makePostRequest(
        makeLeadSubmission({ email: "rate-6@example.com" }),
        "203.0.113.20",
      ),
    );

    expect(blocked.status).toBe(429);
    await expect(blocked.json()).resolves.toMatchObject({ ok: false });
  });

  it("accepts a valid Turnstile token when Turnstile is configured", async () => {
    process.env.TURNSTILE_SECRET_KEY = "test-secret";
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url.includes("challenges.cloudflare.com/turnstile")) {
        return Response.json({ success: true });
      }

      throw new Error(`Unexpected URL: ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);
    const POST = await importRoute();
    const response = await POST(
      makePostRequest(
        makeLeadSubmission({
          turnstileToken: "XXXX.DUMMY.TOKEN.XXXX",
        }),
      ),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("returns a generic server error when GoHighLevel fails", async () => {
    setGoHighLevelEnv();
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Response.json({ message: "provider" }, { status: 401 })),
    );
    const POST = await importRoute();
    const response = await POST(makePostRequest(makeLeadSubmission()));

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      message: "We could not process the request right now. Please try again later.",
    });
  });
});
