import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { automationAssessmentDuplicateMessage } from "@/features/assessments/assessment.constants";
import { leadDuplicateMessage } from "@/features/leads/lead.constants";
import { deriveSubmissionLeadId } from "@/features/leads/submission-id";
import {
  makeAssessmentSubmission,
  makeLeadSubmission,
} from "@/tests/fixtures/leads";
import {
  makeGoHighLevelAssessmentAssociation,
  makeGoHighLevelAssessmentSchemaResponse,
  testGoHighLevelAssociationId,
  testGoHighLevelAssociationKey,
  testGoHighLevelLocationId,
  testGoHighLevelSchemaKey,
} from "@/tests/fixtures/gohighlevel";

const emailMocks = vi.hoisted(() => ({
  sendInternalLeadNotification: vi.fn(),
  sendLeadConfirmationEmail: vi.fn(),
}));
const googleSheetsMocks = vi.hoisted(() => ({
  appendLeadToGoogleSheet: vi.fn(),
}));

vi.mock("@/features/leads/email", () => emailMocks);
vi.mock("@/features/leads/google-sheets", () => googleSheetsMocks);

function clearIntegrationEnv() {
  delete process.env.GHL_PRIVATE_INTEGRATION_TOKEN;
  delete process.env.GHL_API_KEY;
  delete process.env.GHL_LOCATION_ID;
  delete process.env.GHL_ASSESSMENT_OBJECT_SCHEMA_KEY;
  delete process.env.GHL_ASSESSMENT_CONTACT_ASSOCIATION_KEY;
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
  process.env.GHL_ASSESSMENT_OBJECT_SCHEMA_KEY =
    testGoHighLevelSchemaKey;
  process.env.GHL_ASSESSMENT_CONTACT_ASSOCIATION_KEY =
    testGoHighLevelAssociationKey;
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

function makeContactMutationResponse(
  id: string,
  init: RequestInit | undefined,
) {
  const body = JSON.parse(String(init?.body)) as Record<string, unknown>;

  return {
    contact: {
      id,
      locationId: testGoHighLevelLocationId,
      firstName: body.firstName ?? "Test",
      lastName: body.lastName ?? "Person",
      email: body.email ?? "test@example.com",
      phone: body.phone ?? "+15551234567",
      companyName: body.companyName ?? "Example Business",
      website: body.website,
      timezone: body.timezone,
    },
  };
}

function maybeContactReadResponse(url: string, init?: RequestInit) {
  if (url.endsWith("/contacts/search")) {
    return Response.json({ contacts: [], total: 0 });
  }

  if (init?.method === "GET" && url.endsWith("/notes")) {
    return Response.json({ notes: [] });
  }

  return undefined;
}

function mockSuccessfulGoHighLevelFetch() {
  const fetchMock = vi.fn(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      const contactRead = maybeContactReadResponse(url, init);
      if (contactRead) return contactRead;

      if (url.endsWith("/contacts/upsert")) {
        return Response.json(
          makeContactMutationResponse("contact-123", init),
        );
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

function mockSuccessfulAssessmentGoHighLevelFetch() {
  const fetchMock = vi.fn(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      const contactRead = maybeContactReadResponse(url, init);
      if (contactRead) return contactRead;

      if (url.includes(`/objects/${testGoHighLevelSchemaKey}?`)) {
        return Response.json(makeGoHighLevelAssessmentSchemaResponse());
      }

      if (url.includes("/associations/key/")) {
        return Response.json(makeGoHighLevelAssessmentAssociation());
      }

      if (url.endsWith("/records/search")) {
        return Response.json({ records: [], total: 0 });
      }

      if (url.endsWith("/contacts/upsert")) {
        return Response.json(
          makeContactMutationResponse("contact-123", init),
        );
      }

      if (
        url.endsWith(
          `/objects/${testGoHighLevelSchemaKey}/records`,
        )
      ) {
        return Response.json(
          { record: { id: "assessment-record" } },
          { status: 201 },
        );
      }

      if (
        url.includes(
          "/associations/relations/assessment-record?",
        )
      ) {
        return Response.json({ relations: [] });
      }

      if (url.endsWith("/associations/relations")) {
        const body = JSON.parse(String(init?.body)) as {
          firstRecordId: string;
          secondRecordId: string;
        };

        return Response.json(
          {
            id: "relation-1",
            firstObjectKey: testGoHighLevelSchemaKey,
            firstRecordId: body.firstRecordId,
            secondObjectKey: "contact",
            secondRecordId: body.secondRecordId,
            associationId: testGoHighLevelAssociationId,
            locationId: testGoHighLevelLocationId,
          },
          { status: 201 },
        );
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

function mockStatefulCrossFormGoHighLevelFetch() {
  let contact: Record<string, unknown> | undefined;
  const notes: Array<{ id: string; body: string }> = [];
  let assessmentRecordCount = 0;

  const fetchMock = vi.fn(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);

      if (url.includes(`/objects/${testGoHighLevelSchemaKey}?`)) {
        return Response.json(makeGoHighLevelAssessmentSchemaResponse());
      }

      if (url.includes("/associations/key/")) {
        return Response.json(makeGoHighLevelAssessmentAssociation());
      }

      if (url.endsWith("/contacts/search")) {
        const body = JSON.parse(String(init?.body)) as {
          filters: Array<{ field: "email" | "phone"; value: string }>;
        };
        const filter = body.filters[0];
        const matches =
          contact &&
          (filter.field === "email"
            ? String(contact.email).trim().toLowerCase() ===
              filter.value.trim().toLowerCase()
            : String(contact.phone).replace(/\D/g, "") ===
              filter.value.replace(/\D/g, ""));

        return Response.json({
          contacts: matches ? [contact] : [],
          total: matches ? 1 : 0,
        });
      }

      if (url.endsWith("/contacts/upsert")) {
        contact = makeContactMutationResponse("contact-shared", init).contact;
        return Response.json({ contact });
      }

      if (
        url.endsWith("/contacts/contact-shared") &&
        init?.method === "PUT"
      ) {
        contact = {
          ...contact,
          ...(JSON.parse(String(init.body)) as Record<string, unknown>),
        };
        return Response.json({ contact });
      }

      if (
        url.endsWith("/contacts/contact-shared/notes") &&
        init?.method === "GET"
      ) {
        return Response.json({ notes });
      }

      if (
        url.endsWith("/contacts/contact-shared/notes") &&
        init?.method === "POST"
      ) {
        const body = JSON.parse(String(init.body)) as { body: string };
        const note = { id: `note-${notes.length + 1}`, body: body.body };
        notes.push(note);
        return Response.json({ note }, { status: 201 });
      }

      if (url.endsWith("/contacts/contact-shared/tags")) {
        return Response.json({}, { status: 201 });
      }

      if (url.endsWith("/records/search")) {
        return Response.json({ records: [], total: 0 });
      }

      if (
        url.endsWith(`/objects/${testGoHighLevelSchemaKey}/records`)
      ) {
        assessmentRecordCount += 1;
        return Response.json(
          { record: { id: `assessment-${assessmentRecordCount}` } },
          { status: 201 },
        );
      }

      if (url.includes("/associations/relations/assessment-")) {
        return Response.json({ relations: [] });
      }

      if (url.endsWith("/associations/relations")) {
        const body = JSON.parse(String(init?.body)) as {
          firstRecordId: string;
          secondRecordId: string;
        };

        return Response.json(
          {
            id: "relation-1",
            firstObjectKey: testGoHighLevelSchemaKey,
            firstRecordId: body.firstRecordId,
            secondObjectKey: "contact",
            secondRecordId: body.secondRecordId,
            associationId: testGoHighLevelAssociationId,
            locationId: testGoHighLevelLocationId,
          },
          { status: 201 },
        );
      }

      throw new Error(`Unexpected URL: ${url}`);
    },
  );

  vi.stubGlobal("fetch", fetchMock);

  return { fetchMock, getContact: () => contact, notes };
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
    googleSheetsMocks.appendLeadToGoogleSheet.mockReset();
    googleSheetsMocks.appendLeadToGoogleSheet.mockResolvedValue({
      ok: true,
      configured: false,
      provider: "google-sheets",
      message: "Google Sheets stubbed.",
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
    const submission = makeAssessmentSubmission({
      assessmentFollowUpPreference: "confirmation-only",
    });
    const POST = await importRoute();
    const response = await POST(
      makePostRequest(submission),
    );
    const body = await response.json();
    const expectedLeadId = await deriveSubmissionLeadId(
      "automation_assessment",
      submission.submissionId,
    );

    expect(response.status).toBe(200);
    expect(body).toMatchObject({ ok: true, leadId: expectedLeadId });
    expect(body.message).toContain("recorded");
    expect(body.message).toContain("confirmation email");
    expect(emailMocks.sendLeadConfirmationEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        submissionType: "automation_assessment",
        assessmentFollowUpPreference: "confirmation-only",
      }),
    );
  });

  it("short-circuits a completed assessment retry with the same stable lead ID", async () => {
    const submission = makeAssessmentSubmission();
    const POST = await importRoute();
    const first = await POST(makePostRequest(submission));
    const second = await POST(makePostRequest(submission));
    const firstBody = await first.json();
    const secondBody = await second.json();

    expect(first.status).toBe(200);
    expect(firstBody).toMatchObject({
      ok: true,
      leadId: await deriveSubmissionLeadId(
        "automation_assessment",
        submission.submissionId,
      ),
    });
    expect(second.status).toBe(200);
    expect(secondBody).toEqual({
      ok: true,
      message: automationAssessmentDuplicateMessage,
    });
    expect(emailMocks.sendInternalLeadNotification).toHaveBeenCalledTimes(1);
    expect(emailMocks.sendLeadConfirmationEmail).toHaveBeenCalledTimes(1);
  });

  it("short-circuits a completed Quick Request retry with the same stable lead ID", async () => {
    setGoHighLevelEnv();
    const fetchMock = mockSuccessfulGoHighLevelFetch();
    const submission = makeLeadSubmission();
    const POST = await importRoute();
    const first = await POST(makePostRequest(submission));
    const second = await POST(makePostRequest(submission));

    expect(first.status).toBe(200);
    await expect(first.json()).resolves.toMatchObject({
      ok: true,
      leadId: await deriveSubmissionLeadId(
        "quick_request",
        submission.submissionId,
      ),
    });
    expect(second.status).toBe(200);
    await expect(second.json()).resolves.toEqual({
      ok: true,
      message: leadDuplicateMessage,
    });
    expect(
      fetchMock.mock.calls.filter(([input]) =>
        String(input).endsWith("/contacts/upsert"),
      ),
    ).toHaveLength(1);
    expect(
      fetchMock.mock.calls.filter(
        ([input, init]) =>
          String(input).endsWith("/contacts/contact-123/notes") &&
          init?.method === "POST",
      ),
    ).toHaveLength(1);
    expect(emailMocks.sendLeadConfirmationEmail).toHaveBeenCalledTimes(1);
  });

  it.each([
    ["Quick Request then Assessment", "quick_request"],
    ["Assessment then Quick Request", "automation_assessment"],
  ] as const)(
    "accepts %s with one shared Contact",
    async (_label, firstSubmissionType) => {
      setGoHighLevelEnv();
      const { fetchMock, getContact, notes } =
        mockStatefulCrossFormGoHighLevelFetch();
      const sharedIdentity = {
        email: "shared@example.com",
        phone: "+1 (555) 123-4567",
      };
      const quick = makeLeadSubmission(sharedIdentity);
      const assessment = makeAssessmentSubmission(sharedIdentity);
      const ordered =
        firstSubmissionType === "quick_request"
          ? [quick, assessment]
          : [assessment, quick];
      const POST = await importRoute();

      const first = await POST(makePostRequest(ordered[0]));
      const second = await POST(
        makePostRequest(ordered[1], "203.0.113.11"),
      );

      expect(first.status).toBe(200);
      expect(second.status).toBe(200);
      await expect(first.json()).resolves.toMatchObject({ ok: true });
      await expect(second.json()).resolves.toMatchObject({ ok: true });
      expect(getContact()).toMatchObject({
        id: "contact-shared",
        email: sharedIdentity.email,
      });
      expect(
        fetchMock.mock.calls.filter(([input]) =>
          String(input).endsWith("/contacts/upsert"),
        ),
      ).toHaveLength(1);
      expect(
        fetchMock.mock.calls.filter(
          ([input, init]) =>
            String(input).endsWith("/contacts/contact-shared/notes") &&
            init?.method === "POST",
        ),
      ).toHaveLength(2);
      expect(notes).toHaveLength(2);
      expect(
        fetchMock.mock.calls.filter(([input]) =>
          String(input).endsWith("/associations/relations"),
        ),
      ).toHaveLength(1);
      const relationCall = fetchMock.mock.calls.find(([input]) =>
        String(input).endsWith("/associations/relations"),
      );
      expect(JSON.parse(String(relationCall?.[1]?.body))).toMatchObject({
        secondRecordId: "contact-shared",
      });
      expect(emailMocks.sendLeadConfirmationEmail).toHaveBeenCalledTimes(2);
    },
  );

  it("does not process the same assessment concurrently", async () => {
    let releaseNotification: (() => void) | undefined;
    let markNotificationStarted: (() => void) | undefined;
    const notificationGate = new Promise<void>((resolve) => {
      releaseNotification = resolve;
    });
    const notificationStarted = new Promise<void>((resolve) => {
      markNotificationStarted = resolve;
    });
    emailMocks.sendInternalLeadNotification.mockImplementationOnce(
      async () => {
        markNotificationStarted?.();
        await notificationGate;

        return {
          ok: true,
          configured: false,
          provider: "email",
          message: "Internal notification stubbed.",
        };
      },
    );
    const submission = makeAssessmentSubmission();
    const POST = await importRoute();
    const firstResponsePromise = POST(makePostRequest(submission));

    await notificationStarted;
    const concurrentResponse = await POST(makePostRequest(submission));

    expect(concurrentResponse.status).toBe(409);
    await expect(concurrentResponse.json()).resolves.toMatchObject({
      ok: false,
    });
    expect(emailMocks.sendLeadConfirmationEmail).not.toHaveBeenCalled();

    releaseNotification?.();
    const firstResponse = await firstResponsePromise;

    expect(firstResponse.status).toBe(200);
    expect(emailMocks.sendInternalLeadNotification).toHaveBeenCalledTimes(1);
    expect(emailMocks.sendLeadConfirmationEmail).toHaveBeenCalledTimes(1);
  });

  it("fails closed when distributed assessment completion state is unavailable", async () => {
    process.env.UPSTASH_REDIS_REST_URL =
      "https://redis.example.test";
    process.env.UPSTASH_REDIS_REST_TOKEN = "private-test-token";
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new TypeError("temporary Redis failure");
      }),
    );
    const POST = await importRoute();
    const response = await POST(
      makePostRequest(makeAssessmentSubmission()),
    );

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
    });
    expect(emailMocks.sendInternalLeadNotification).not.toHaveBeenCalled();
    expect(emailMocks.sendLeadConfirmationEmail).not.toHaveBeenCalled();
  });

  it("allows an incomplete assessment to retry with the same stable lead ID", async () => {
    setGoHighLevelEnv();
    vi.spyOn(console, "error").mockImplementation(() => {});
    let upsertAttempts = 0;
    const fetchMock = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      const contactRead = maybeContactReadResponse(url, init);
      if (contactRead) return contactRead;

      if (url.includes(`/objects/${testGoHighLevelSchemaKey}?`)) {
        return Response.json(makeGoHighLevelAssessmentSchemaResponse());
      }

      if (url.includes("/associations/key/")) {
        return Response.json(makeGoHighLevelAssessmentAssociation());
      }

      if (url.endsWith("/records/search")) {
        return Response.json({ records: [], total: 0 });
      }

      if (url.endsWith("/contacts/upsert")) {
        upsertAttempts += 1;

        if (upsertAttempts === 1) {
          return Response.json({}, { status: 503 });
        }

        return Response.json(
          makeContactMutationResponse("contact-123", init),
        );
      }

      if (
        url.endsWith(
          `/objects/${testGoHighLevelSchemaKey}/records`,
        )
      ) {
        return Response.json(
          { record: { id: "assessment-record" } },
          { status: 201 },
        );
      }

      if (
        url.includes(
          "/associations/relations/assessment-record?",
        )
      ) {
        return Response.json({ relations: [] });
      }

      if (url.endsWith("/associations/relations")) {
        const body = JSON.parse(String(init?.body)) as {
          firstRecordId: string;
          secondRecordId: string;
        };

        return Response.json(
          {
            id: "relation-1",
            firstObjectKey: testGoHighLevelSchemaKey,
            firstRecordId: body.firstRecordId,
            secondObjectKey: "contact",
            secondRecordId: body.secondRecordId,
            associationId: testGoHighLevelAssociationId,
            locationId: testGoHighLevelLocationId,
          },
          { status: 201 },
        );
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
    const submission = makeAssessmentSubmission();
    const POST = await importRoute();
    const first = await POST(makePostRequest(submission));
    const retry = await POST(makePostRequest(submission));

    expect(first.status).toBe(500);
    expect(retry.status).toBe(200);
    await expect(retry.json()).resolves.toMatchObject({
      ok: true,
      leadId: await deriveSubmissionLeadId(
        "automation_assessment",
        submission.submissionId,
      ),
    });
    expect(upsertAttempts).toBe(2);
    expect(emailMocks.sendLeadConfirmationEmail).toHaveBeenCalledTimes(1);
  });

  it("does not repeat completed GoHighLevel work when downstream processing retries", async () => {
    setGoHighLevelEnv();
    const fetchMock = mockSuccessfulAssessmentGoHighLevelFetch();
    googleSheetsMocks.appendLeadToGoogleSheet
      .mockRejectedValueOnce(new Error("temporary sheets failure"))
      .mockResolvedValueOnce({
        ok: true,
        configured: false,
        provider: "google-sheets",
        message: "Google Sheets stubbed.",
      });
    const submission = makeAssessmentSubmission();
    const POST = await importRoute();
    const first = await POST(makePostRequest(submission));
    const retry = await POST(makePostRequest(submission));

    expect(first.status).toBe(500);
    expect(retry.status).toBe(200);
    await expect(retry.json()).resolves.toMatchObject({
      ok: true,
      leadId: await deriveSubmissionLeadId(
        "automation_assessment",
        submission.submissionId,
      ),
    });
    expect(
      fetchMock.mock.calls.filter(([input]) =>
        String(input).endsWith("/contacts/upsert"),
      ),
    ).toHaveLength(1);
    expect(
      fetchMock.mock.calls.filter(([input]) =>
        String(input).endsWith(
          `/objects/${testGoHighLevelSchemaKey}/records`,
        ),
      ),
    ).toHaveLength(1);
    expect(
      fetchMock.mock.calls.filter(([input]) =>
        String(input).endsWith("/associations/relations"),
      ),
    ).toHaveLength(1);
    expect(
      fetchMock.mock.calls.filter(
        ([input, init]) =>
          String(input).endsWith("/contacts/contact-123/notes") &&
          init?.method === "POST",
      ),
    ).toHaveLength(1);
    expect(googleSheetsMocks.appendLeadToGoogleSheet).toHaveBeenCalledTimes(
      2,
    );
    expect(emailMocks.sendLeadConfirmationEmail).toHaveBeenCalledTimes(1);
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
          submissionId: "323e4567-e89b-42d3-a456-426614174000",
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
    expect(fetchMock).toHaveBeenCalledTimes(5);
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
          submissionId: "323e4567-e89b-42d3-a456-426614174000",
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
    expect(fetchMock).toHaveBeenCalledTimes(6);
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
    const second = await POST(
      makePostRequest(
        makeLeadSubmission({
          submissionId: "323e4567-e89b-42d3-a456-426614174000",
        }),
      ),
    );

    await expect(first.json()).resolves.toMatchObject({ ok: true });
    await expect(second.json()).resolves.toMatchObject({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(10);
    expect(emailMocks.sendLeadConfirmationEmail).toHaveBeenCalledTimes(2);
  });

  it("blocks the fourth request from the same client signal in an hour", async () => {
    const POST = await importRoute();

    for (let i = 0; i < 3; i += 1) {
      const response = await POST(
        makePostRequest(
          makeLeadSubmission({
            submissionId: `${i + 3}23e4567-e89b-42d3-a456-426614174000`,
            email: `rate-${i}@example.com`,
          }),
          "203.0.113.20",
        ),
      );

      expect(response.status).toBe(200);
    }

    const blocked = await POST(
      makePostRequest(
        makeLeadSubmission({
          submissionId: "623e4567-e89b-42d3-a456-426614174000",
          email: "rate-4@example.com",
        }),
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
        "We couldn't process this request automatically. Please verify your contact information or email contact@tergion.com.",
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

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      message:
        "We couldn't process this request automatically. Please verify your contact information or email contact@tergion.com.",
    });
    expect(emailMocks.sendLeadConfirmationEmail).not.toHaveBeenCalled();
  });

  it("does not reveal whether submitted identifiers exist when resolution conflicts", async () => {
    setGoHighLevelEnv();
    const fetchMock = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);

        if (!url.endsWith("/contacts/search")) {
          throw new Error(`Unexpected URL: ${url}`);
        }

        const body = JSON.parse(String(init?.body)) as {
          filters: Array<{ field: "email" | "phone" }>;
        };
        const isEmail = body.filters[0]?.field === "email";

        return Response.json({
          contacts: [
            {
              id: isEmail ? "contact-email" : "contact-phone",
              locationId: testGoHighLevelLocationId,
              email: isEmail ? "test@example.com" : "other@example.com",
              phone: isEmail ? "+15550000000" : "+15551234567",
            },
          ],
          total: 1,
        });
      },
    );
    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(console, "error").mockImplementation(() => {});
    const POST = await importRoute();
    const response = await POST(
      makePostRequest(
        makeLeadSubmission({
          email: "test@example.com",
          phone: "+15551234567",
        }),
      ),
    );
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body).toEqual({
      ok: false,
      message:
        "We couldn't process this request automatically. Please verify your contact information or email contact@tergion.com.",
    });
    expect(JSON.stringify(body)).not.toContain("contact-email");
    expect(JSON.stringify(body)).not.toContain("contact-phone");
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
