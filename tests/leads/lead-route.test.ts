import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { leadDuplicateMessage } from "@/features/leads/lead.constants";
import {
  makeAssessmentSubmission,
  makeLeadSubmission,
} from "@/tests/fixtures/leads";

const emailMocks = vi.hoisted(() => ({
  sendInternalLeadNotification: vi.fn(),
  sendLeadConfirmationEmail: vi.fn(),
}));

vi.mock("@/features/leads/email", () => emailMocks);

function clearIntegrationEnv() {
  delete process.env.GHL_PRIVATE_INTEGRATION_TOKEN;
  delete process.env.GHL_API_KEY;
  delete process.env.GHL_LOCATION_ID;
  delete process.env.TURNSTILE_SECRET_KEY;
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
  delete process.env.EMAIL_PROVIDER;
  delete process.env.RESEND_API_KEY;
  delete process.env.POSTMARK_SERVER_TOKEN;
  delete process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
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
    emailMocks.sendInternalLeadNotification.mockReset();
    emailMocks.sendInternalLeadNotification.mockResolvedValue({
      ok: true,
      configured: false,
      provider: "email",
      message: "Internal notification stubbed.",
    });
    emailMocks.sendLeadConfirmationEmail.mockReset();
    emailMocks.sendLeadConfirmationEmail.mockResolvedValue({
      ok: true,
      configured: true,
      provider: "resend",
      message: "Lead confirmation email sent.",
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
    clearIntegrationEnv();
  });

  it("returns silent success for honeypot spam without calling providers", async () => {
    setGoHighLevelEnv();
    const fetchMock = mockSuccessfulGoHighLevelFetch();
    const POST = await importRoute();
    const response = await POST(
      makePostRequest(makeLeadSubmission({ honeypot: "filled" })),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ ok: true });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(emailMocks.sendInternalLeadNotification).not.toHaveBeenCalled();
    expect(emailMocks.sendLeadConfirmationEmail).not.toHaveBeenCalled();
  });

  it("accepts a cached legacy Quick Request without discriminator fields", async () => {
    const { submissionType: _type, formVersion: _version, ...legacy } =
      makeLeadSubmission();
    void _type;
    void _version;
    const POST = await importRoute();
    const response = await POST(makePostRequest(legacy));

    expect(response.status).toBe(200);
    expect(emailMocks.sendLeadConfirmationEmail).toHaveBeenCalledWith(
      expect.objectContaining({ submissionType: "quick_request" }),
    );
  });

  it("accepts an assessment and preserves confirmation-only behavior", async () => {
    const POST = await importRoute();
    const response = await POST(
      makePostRequest(
        makeAssessmentSubmission({
          assessmentFollowUpPreference: "confirmation-only",
        }),
      ),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({ ok: true });
    expect(body.message).toContain("recorded");
    expect(body.message).toContain("confirmation email");
    expect(emailMocks.sendLeadConfirmationEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        submissionType: "automation_assessment",
        assessmentFollowUpPreference: "confirmation-only",
      }),
    );
  });

  it("rejects a wrong content type", async () => {
    const POST = await importRoute();
    const response = await POST(
      new Request("https://tergion.com/api/leads", {
        method: "POST",
        headers: { "content-type": "text/plain" },
        body: JSON.stringify(makeLeadSubmission()),
      }),
    );

    expect(response.status).toBe(415);
    expect(emailMocks.sendLeadConfirmationEmail).not.toHaveBeenCalled();
  });

  it("rejects a request body larger than 32 KB", async () => {
    const POST = await importRoute();
    const response = await POST(
      new Request("https://tergion.com/api/leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ value: "x".repeat(33 * 1024) }),
      }),
    );

    expect(response.status).toBe(413);
    expect(emailMocks.sendLeadConfirmationEmail).not.toHaveBeenCalled();
  });

  it("rejects too-fast submissions without sending confirmation", async () => {
    const POST = await importRoute();
    const response = await POST(
      makePostRequest(
        makeLeadSubmission({
          completionStartedAt: Date.now(),
        }),
      ),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({ ok: false });
    expect(emailMocks.sendLeadConfirmationEmail).not.toHaveBeenCalled();
  });

  it("sends one confirmation for an accepted lead", async () => {
    const POST = await importRoute();
    const response = await POST(makePostRequest(makeLeadSubmission()));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ ok: true });
    expect(emailMocks.sendLeadConfirmationEmail).toHaveBeenCalledTimes(1);
    expect(emailMocks.sendLeadConfirmationEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "test@example.com",
        businessName: "Example Business",
      }),
    );
  });

  it("returns a calm duplicate message for repeated email submissions before calling GoHighLevel again", async () => {
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
    await expect(second.json()).resolves.toMatchObject({
      ok: true,
      message: leadDuplicateMessage,
    });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(emailMocks.sendLeadConfirmationEmail).toHaveBeenCalledTimes(1);
  });

  it("returns a calm duplicate message for repeated phone submissions before calling GoHighLevel again", async () => {
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
    await expect(second.json()).resolves.toMatchObject({
      ok: true,
      message: leadDuplicateMessage,
    });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(emailMocks.sendLeadConfirmationEmail).toHaveBeenCalledTimes(1);
  });

  it("allows repeated contact submissions after the duplicate cooldown", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-10T12:00:00.000Z"));
    setGoHighLevelEnv();
    const fetchMock = mockSuccessfulGoHighLevelFetch();
    const POST = await importRoute();
    const first = await POST(makePostRequest(makeLeadSubmission()));

    vi.setSystemTime(new Date("2026-07-10T12:16:00.000Z"));
    const second = await POST(makePostRequest(makeLeadSubmission()));

    await expect(first.json()).resolves.toMatchObject({ ok: true });
    await expect(second.json()).resolves.toMatchObject({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(6);
    expect(emailMocks.sendLeadConfirmationEmail).toHaveBeenCalledTimes(2);
  });

  it("blocks the fourth request from the same client signal in an hour", async () => {
    const POST = await importRoute();

    for (let i = 0; i < 3; i += 1) {
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
        makeLeadSubmission({ email: "rate-4@example.com" }),
        "203.0.113.20",
      ),
    );

    expect(blocked.status).toBe(429);
    await expect(blocked.json()).resolves.toMatchObject({ ok: false });
    expect(emailMocks.sendLeadConfirmationEmail).toHaveBeenCalledTimes(3);
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
    expect(emailMocks.sendLeadConfirmationEmail).toHaveBeenCalledTimes(1);
  });

  it("returns a generic verification error when Turnstile verification fails", async () => {
    process.env.TURNSTILE_SECRET_KEY = "test-secret";
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url.includes("challenges.cloudflare.com/turnstile")) {
        return Response.json({
          success: false,
          "error-codes": ["timeout-or-duplicate"],
        });
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

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      message: "We could not verify the request. Please try again.",
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(emailMocks.sendLeadConfirmationEmail).not.toHaveBeenCalled();
  });

  it("rejects a missing token when Turnstile is configured", async () => {
    process.env.TURNSTILE_SECRET_KEY = "test-secret";
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const POST = await importRoute();
    const response = await POST(makePostRequest(makeLeadSubmission()));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      message: "We could not verify the request. Please try again.",
    });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(emailMocks.sendLeadConfirmationEmail).not.toHaveBeenCalled();
  });

  it("fails closed when production Turnstile configuration is missing", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const POST = await importRoute();
    const response = await POST(
      makePostRequest(
        makeLeadSubmission({
          turnstileToken: "unverified-production-token",
        }),
      ),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      message: "We could not verify the request. Please try again.",
    });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(emailMocks.sendLeadConfirmationEmail).not.toHaveBeenCalled();
  });

  it("fails closed when production GoHighLevel delivery is unconfigured", async () => {
    vi.stubEnv("NODE_ENV", "production");
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

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      message:
        "We could not process the request right now. Please try again later.",
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(emailMocks.sendLeadConfirmationEmail).not.toHaveBeenCalled();
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
    expect(emailMocks.sendLeadConfirmationEmail).not.toHaveBeenCalled();
  });

  it("keeps an accepted lead successful when confirmation delivery throws", async () => {
    const warning = vi.spyOn(console, "warn").mockImplementation(() => {});
    emailMocks.sendLeadConfirmationEmail.mockRejectedValueOnce(
      new Error("private provider response"),
    );
    const POST = await importRoute();
    const response = await POST(makePostRequest(makeLeadSubmission()));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({ ok: true });
    expect(JSON.stringify(body)).not.toContain("private provider response");
    expect(warning).toHaveBeenCalledWith(
      "Lead confirmation email delivery failed",
      expect.objectContaining({
        provider: "email",
        stage: "route",
      }),
    );
  });

  it("keeps provider failure details out of an accepted lead response", async () => {
    emailMocks.sendLeadConfirmationEmail.mockResolvedValueOnce({
      ok: false,
      configured: true,
      provider: "resend",
      message: "private provider rejection",
    });
    const POST = await importRoute();
    const response = await POST(makePostRequest(makeLeadSubmission()));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({ ok: true });
    expect(JSON.stringify(body)).not.toContain("private provider rejection");
  });
});
