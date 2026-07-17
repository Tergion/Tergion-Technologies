import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { makeLeadRecord } from "@/tests/fixtures/leads";

function clearEmailEnv() {
  delete process.env.EMAIL_PROVIDER;
  delete process.env.RESEND_API_KEY;
  delete process.env.POSTMARK_SERVER_TOKEN;
  delete process.env.LEAD_NOTIFICATION_EMAIL;
}

describe("sendLeadConfirmationEmail", () => {
  beforeEach(() => {
    vi.resetModules();
    clearEmailEnv();
    process.env.NEXT_PUBLIC_SITE_URL = "https://tergion.com";
  });

  afterEach(() => {
    vi.useRealTimers();
    clearEmailEnv();
    delete process.env.NEXT_PUBLIC_SITE_URL;
  });

  it("does not call a provider when email is not configured", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const { sendLeadConfirmationEmail } = await import(
      "@/features/leads/email"
    );

    await expect(
      sendLeadConfirmationEmail(makeLeadRecord()),
    ).resolves.toMatchObject({
      ok: true,
      configured: false,
      provider: "email",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sends multipart confirmation through Resend", async () => {
    process.env.EMAIL_PROVIDER = "resend";
    process.env.RESEND_API_KEY = "resend-test-secret";
    const fetchMock = vi.fn(
      async (_input: RequestInfo | URL, _init?: RequestInit) => {
        void _input;
        void _init;
        return Response.json({ id: "email-123" }, { status: 200 });
      },
    );
    vi.stubGlobal("fetch", fetchMock);
    const { sendLeadConfirmationEmail } = await import(
      "@/features/leads/email"
    );

    await expect(
      sendLeadConfirmationEmail(makeLeadRecord()),
    ).resolves.toMatchObject({
      ok: true,
      configured: true,
      provider: "resend",
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    const headers = init?.headers as Record<string, string>;
    const body = JSON.parse(String(init?.body)) as Record<string, unknown>;

    expect(url).toBe("https://api.resend.com/emails");
    expect(headers).toMatchObject({
      Authorization: "Bearer resend-test-secret",
      "Content-Type": "application/json",
      "Idempotency-Key": "lead-confirmation-lead-123",
    });
    expect(body).toMatchObject({
      from: "Tergion Technologies <noreply@tergion.com>",
      to: ["test@example.com"],
      subject: "We received your Tergion request",
      reply_to: "noreply@tergion.com",
    });
    expect(body.html).toContain("Request received");
    expect(body.text).toContain("YOUR REQUEST DETAILS");
    expect(JSON.stringify(body)).not.toContain("resend-test-secret");
  });

  it("sends multipart confirmation through the Postmark outbound stream", async () => {
    process.env.EMAIL_PROVIDER = "postmark";
    process.env.POSTMARK_SERVER_TOKEN = "postmark-test-secret";
    const fetchMock = vi.fn(
      async (_input: RequestInfo | URL, _init?: RequestInit) => {
        void _input;
        void _init;
        return Response.json({ ErrorCode: 0, MessageID: "message-123" });
      },
    );
    vi.stubGlobal("fetch", fetchMock);
    const { sendLeadConfirmationEmail } = await import(
      "@/features/leads/email"
    );

    await expect(
      sendLeadConfirmationEmail(makeLeadRecord()),
    ).resolves.toMatchObject({
      ok: true,
      configured: true,
      provider: "postmark",
    });

    const [url, init] = fetchMock.mock.calls[0];
    const headers = init?.headers as Record<string, string>;
    const body = JSON.parse(String(init?.body)) as Record<string, unknown>;

    expect(url).toBe("https://api.postmarkapp.com/email");
    expect(headers).toMatchObject({
      "X-Postmark-Server-Token": "postmark-test-secret",
      "Content-Type": "application/json",
    });
    expect(body).toMatchObject({
      From: "Tergion Technologies <noreply@tergion.com>",
      To: "test@example.com",
      Subject: "We received your Tergion request",
      ReplyTo: "noreply@tergion.com",
      MessageStream: "outbound",
      TrackOpens: false,
      TrackLinks: "None",
    });
    expect(body.HtmlBody).toContain("Request received");
    expect(body.TextBody).toContain("YOUR REQUEST DETAILS");
    expect(JSON.stringify(body)).not.toContain("postmark-test-secret");
  });

  it("returns a safe failure for incomplete or unsupported configuration", async () => {
    process.env.EMAIL_PROVIDER = "unsupported";
    process.env.RESEND_API_KEY = "private-token";
    const warning = vi.spyOn(console, "warn").mockImplementation(() => {});
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const { sendLeadConfirmationEmail } = await import(
      "@/features/leads/email"
    );

    const result = await sendLeadConfirmationEmail(makeLeadRecord());

    expect(result).toMatchObject({
      ok: false,
      configured: false,
      provider: "email",
    });
    expect(JSON.stringify(result)).not.toContain("private-token");
    expect(fetchMock).not.toHaveBeenCalled();
    expect(warning).toHaveBeenCalled();
  });

  it("does not attempt delivery when a recognized provider is incomplete", async () => {
    process.env.EMAIL_PROVIDER = "resend";
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const { sendLeadConfirmationEmail } = await import(
      "@/features/leads/email"
    );

    await expect(
      sendLeadConfirmationEmail(makeLeadRecord()),
    ).resolves.toMatchObject({
      ok: false,
      configured: false,
      provider: "resend",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("contains a provider rejection without exposing its response", async () => {
    process.env.EMAIL_PROVIDER = "resend";
    process.env.RESEND_API_KEY = "resend-test-secret";
    const warning = vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json(
          { message: "private provider rejection" },
          { status: 422 },
        ),
      ),
    );
    const { sendLeadConfirmationEmail } = await import(
      "@/features/leads/email"
    );

    const result = await sendLeadConfirmationEmail(makeLeadRecord());

    expect(result).toMatchObject({
      ok: false,
      configured: true,
      provider: "resend",
      message: "Confirmation email delivery failed.",
    });
    expect(JSON.stringify(result)).not.toContain("private provider rejection");
    expect(warning).toHaveBeenCalledWith(
      "Lead confirmation email delivery failed",
      expect.objectContaining({
        provider: "resend",
        stage: "response",
        status: 422,
      }),
    );
  });

  it("bounds a slow provider request with a five-second timeout", async () => {
    vi.useFakeTimers();
    process.env.EMAIL_PROVIDER = "resend";
    process.env.RESEND_API_KEY = "resend-test-secret";
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async (_input: RequestInfo | URL, init?: RequestInit) =>
          new Promise<Response>((_resolve, reject) => {
            init?.signal?.addEventListener("abort", () => {
              reject(new DOMException("Aborted", "AbortError"));
            });
          }),
      ),
    );
    const { sendLeadConfirmationEmail } = await import(
      "@/features/leads/email"
    );

    const pending = sendLeadConfirmationEmail(makeLeadRecord());
    await vi.advanceTimersByTimeAsync(5_000);

    await expect(pending).resolves.toMatchObject({
      ok: false,
      configured: true,
      provider: "resend",
    });
  });

  it("treats a Postmark response error code as a safe delivery failure", async () => {
    process.env.EMAIL_PROVIDER = "postmark";
    process.env.POSTMARK_SERVER_TOKEN = "postmark-test-secret";
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json({ ErrorCode: 406, Message: "private rejection" }),
      ),
    );
    const { sendLeadConfirmationEmail } = await import(
      "@/features/leads/email"
    );

    const result = await sendLeadConfirmationEmail(makeLeadRecord());

    expect(result).toMatchObject({
      ok: false,
      configured: true,
      provider: "postmark",
      message: "Confirmation email delivery failed.",
    });
    expect(JSON.stringify(result)).not.toContain("private rejection");
  });
});
