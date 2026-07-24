import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  getTestGoHighLevelOptionValue,
  makeGoHighLevelAssessmentAssociation,
  makeGoHighLevelAssessmentSchemaResponse,
  testAssessmentPropertyKeys,
  testGoHighLevelAssociationId,
  testGoHighLevelAssociationKey,
  testGoHighLevelLocationId,
  testGoHighLevelSchemaKey,
} from "@/tests/fixtures/gohighlevel";
import {
  makeAssessmentRecord,
  makeLeadRecord,
} from "@/tests/fixtures/leads";

function setGoHighLevelEnv() {
  process.env.GHL_PRIVATE_INTEGRATION_TOKEN = "test-token";
  process.env.GHL_API_KEY = "";
  process.env.GHL_LOCATION_ID = testGoHighLevelLocationId;
  process.env.GHL_SOURCE = "Vitest source";
  process.env.GHL_LEAD_TAGS = "website-lead, automation-review";
  process.env.GHL_ASSESSMENT_OBJECT_SCHEMA_KEY =
    testGoHighLevelSchemaKey;
  process.env.GHL_ASSESSMENT_CONTACT_ASSOCIATION_KEY =
    testGoHighLevelAssociationKey;
}

function clearGoHighLevelEnv() {
  delete process.env.GHL_PRIVATE_INTEGRATION_TOKEN;
  delete process.env.GHL_API_KEY;
  delete process.env.GHL_LOCATION_ID;
  delete process.env.GHL_SOURCE;
  delete process.env.GHL_LEAD_TAGS;
  delete process.env.GHL_ASSESSMENT_OBJECT_SCHEMA_KEY;
  delete process.env.GHL_ASSESSMENT_CONTACT_ASSOCIATION_KEY;
}

function jsonResponse(value: unknown, status = 200) {
  return Response.json(value, { status });
}

function unreadableJsonResponse(status: number) {
  return new Response(
    new ReadableStream<Uint8Array>({
      start(controller) {
        controller.error(new TypeError("provider stream reset"));
      },
    }),
    {
      status,
      headers: { "Content-Type": "application/json" },
    },
  );
}

function requestBody(init: RequestInit | undefined) {
  return JSON.parse(String(init?.body)) as Record<string, unknown>;
}

function callsFor(fetchMock: ReturnType<typeof vi.fn>, path: string) {
  return fetchMock.mock.calls.filter(([input]) =>
    String(input).includes(path),
  );
}

function makeCompleteAssessment(
  overrides: Partial<ReturnType<typeof makeAssessmentRecord>> = {},
) {
  return makeAssessmentRecord({
    leadId: "assessment-123",
    lastName: "Person",
    timezone: "America/Los_Angeles",
    schedulingPreference: "Weekday afternoons",
    customerValueRange: "1000-to-5000",
    websiteInquiryProcess: "manual-contact",
    incomingCallOwner: "other",
    incomingCallOwnerOther: "Service desk",
    quoteFollowUpProcess: "automatic-reminders",
    pipelineVisibility: "one-system",
    leadTrackingMethod: "crm",
    biggestChallenge: "other",
    biggestChallengeOther: "Disconnected tools",
    assessmentFollowUpPreference: "confirmation-only",
    additionalNotes: "First line\nSecond line",
    smsConsent: true,
    landingPage: "https://tergion.com/assessment",
    triggerSource: "hero",
    ...overrides,
  });
}

describe("sendLeadToGoHighLevel", () => {
  beforeEach(() => {
    vi.resetModules();
    setGoHighLevelEnv();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    clearGoHighLevelEnv();
  });

  it("keeps Quick Request on the existing contact, tag, and note path", async () => {
    const fetchMock = vi.fn(
      async (input: RequestInfo | URL, _init?: RequestInit) => {
        void _init;
        const url = String(input);

        if (url.endsWith("/contacts/upsert")) {
          return jsonResponse({ contact: { id: "contact-123" } });
        }

        if (
          url.endsWith("/contacts/contact-123/tags") ||
          url.endsWith("/contacts/contact-123/notes")
        ) {
          return jsonResponse({}, 201);
        }

        throw new Error(`Unexpected URL: ${url}`);
      },
    );
    vi.stubGlobal("fetch", fetchMock);
    const { sendLeadToGoHighLevel } = await import(
      "@/features/leads/gohighlevel"
    );
    const lead = makeLeadRecord({
      lastName: "Person",
      phone: "+15551234567",
      website: "https://example.com",
      timezone: "America/Los_Angeles",
      currentCrm: "HubSpot",
      automationInterests: ["CRM setup", "Lead follow-up"],
      notes: "Interested in faster follow-up.",
      utmSource: "google",
      turnstileToken: "internal-token",
      honeypot: "internal-honeypot",
    });

    await expect(sendLeadToGoHighLevel(lead)).resolves.toMatchObject({
      ok: true,
      configured: true,
    });

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(
      fetchMock.mock.calls.some(([input]) =>
        String(input).includes("/objects/"),
      ),
    ).toBe(false);
    expect(
      fetchMock.mock.calls.some(([input]) =>
        String(input).includes("/associations/"),
      ),
    ).toBe(false);

    const [, upsertInit] = fetchMock.mock.calls[0];
    expect(upsertInit?.headers).toMatchObject({
      Authorization: "Bearer test-token",
      Version: "v3",
      "Content-Type": "application/json",
    });
    expect(requestBody(upsertInit)).toMatchObject({
      firstName: "Test",
      lastName: "Person",
      email: "test@example.com",
      phone: "+15551234567",
      companyName: "Example Business",
      website: "https://example.com",
      timezone: "America/Los_Angeles",
      source: "Vitest source",
      locationId: testGoHighLevelLocationId,
      createNewIfDuplicateAllowed: false,
    });
    expect(requestBody(upsertInit)).not.toHaveProperty("notes");
    expect(requestBody(upsertInit)).not.toHaveProperty("honeypot");
    expect(requestBody(upsertInit)).not.toHaveProperty("turnstileToken");
  });

  it("creates and associates one fully mapped Automation Assessment", async () => {
    const fetchMock = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);

        if (url.includes(`/objects/${testGoHighLevelSchemaKey}?`)) {
          return jsonResponse(makeGoHighLevelAssessmentSchemaResponse());
        }

        if (
          url.includes(
            `/associations/key/${testGoHighLevelAssociationKey}?`,
          )
        ) {
          return jsonResponse(
            makeGoHighLevelAssessmentAssociation("contact-first"),
          );
        }

        if (url.endsWith("/records/search")) {
          return jsonResponse({ records: [], total: 0 });
        }

        if (url.endsWith("/contacts/upsert")) {
          return jsonResponse({ contact: { id: "contact-assessment" } });
        }

        if (
          url.endsWith(
            `/objects/${testGoHighLevelSchemaKey}/records`,
          )
        ) {
          return jsonResponse(
            { record: { id: "assessment-record" } },
            201,
          );
        }

        if (
          url.includes(
            "/associations/relations/assessment-record?",
          )
        ) {
          return jsonResponse({ relations: [] });
        }

        if (url.endsWith("/associations/relations")) {
          const body = requestBody(init);

          return jsonResponse(
            {
              id: "relation-1",
              firstObjectKey: "contact",
              firstRecordId: body.firstRecordId,
              secondObjectKey: testGoHighLevelSchemaKey,
              secondRecordId: body.secondRecordId,
              associationId: testGoHighLevelAssociationId,
              locationId: testGoHighLevelLocationId,
            },
            201,
          );
        }

        if (
          url.endsWith("/contacts/contact-assessment/tags") ||
          url.endsWith("/contacts/contact-assessment/notes")
        ) {
          return jsonResponse({}, 201);
        }

        throw new Error(`Unexpected URL: ${url}`);
      },
    );
    vi.stubGlobal("fetch", fetchMock);
    const { sendLeadToGoHighLevel } = await import(
      "@/features/leads/gohighlevel"
    );

    await expect(
      sendLeadToGoHighLevel(makeCompleteAssessment()),
    ).resolves.toMatchObject({ ok: true, configured: true });

    const createCalls = callsFor(
      fetchMock,
      `/objects/${testGoHighLevelSchemaKey}/records`,
    ).filter(([input]) => !String(input).endsWith("/records/search"));
    expect(createCalls).toHaveLength(1);
    const createBody = requestBody(createCalls[0][1]);
    const properties = createBody.properties as Record<string, string>;

    expect(createBody).toEqual({
      locationId: testGoHighLevelLocationId,
      properties: expect.any(Object),
    });
    expect(Object.keys(properties)).toHaveLength(21);
    expect(Object.keys(properties).sort()).toEqual(
      Object.values(testAssessmentPropertyKeys).sort(),
    );
    expect(properties).toMatchObject({
      [testAssessmentPropertyKeys.assessmentReference]:
        "TA-assessment-123",
      [testAssessmentPropertyKeys.preferredContactMethod]:
        getTestGoHighLevelOptionValue(
          "preferredContactMethod",
          "email",
        ),
      [testAssessmentPropertyKeys.monthlyLeadRange]:
        getTestGoHighLevelOptionValue(
          "monthlyLeadRange",
          "20-to-50",
        ),
      [testAssessmentPropertyKeys.customerValueRange]:
        getTestGoHighLevelOptionValue(
          "customerValueRange",
          "1000-to-5000",
        ),
      [testAssessmentPropertyKeys.contactConsent]:
        getTestGoHighLevelOptionValue("contactConsent", "true"),
      [testAssessmentPropertyKeys.privacyTermsConsent]:
        getTestGoHighLevelOptionValue(
          "privacyTermsConsent",
          "true",
        ),
      [testAssessmentPropertyKeys.smsConsent]:
        getTestGoHighLevelOptionValue("smsConsent", "true"),
    });
    expect(properties).not.toHaveProperty("landing_page");
    expect(properties).not.toHaveProperty("trigger_source");
    expect(properties).not.toHaveProperty("first_name");
    expect(properties).not.toHaveProperty("last_name");
    expect(properties).not.toHaveProperty("company_name");
    expect(properties).not.toHaveProperty("email");
    expect(properties).not.toHaveProperty("phone");
    expect(properties).not.toHaveProperty("timezone");

    const searchBody = requestBody(
      callsFor(fetchMock, "/records/search")[0][1],
    );
    expect(searchBody).toEqual({
      locationId: testGoHighLevelLocationId,
      page: 1,
      pageLimit: 20,
      query: "TA-assessment-123",
      filters: [
        {
          group: "AND",
          filters: [
            {
              field: `properties.${testAssessmentPropertyKeys.assessmentReference}`,
              operator: "eq",
              value: "TA-assessment-123",
            },
          ],
        },
      ],
      searchAfter: [],
    });

    const upsertCall = callsFor(fetchMock, "/contacts/upsert")[0];
    expect(requestBody(upsertCall[1])).toMatchObject({
      firstName: "Assessment",
      lastName: "Person",
      companyName: "Assessment Business",
      email: "assessment@example.com",
      phone: "+1 555 123 4567",
      timezone: "America/Los_Angeles",
    });
    expect(requestBody(upsertCall[1])).not.toHaveProperty("website");

    const relationBody = requestBody(
      callsFor(fetchMock, "/associations/relations").find(([input]) =>
        String(input).endsWith("/associations/relations"),
      )?.[1],
    );
    expect(relationBody).toEqual({
      locationId: testGoHighLevelLocationId,
      associationId: testGoHighLevelAssociationId,
      firstRecordId: "contact-assessment",
      secondRecordId: "assessment-record",
    });

    const tagBody = requestBody(
      callsFor(fetchMock, "/contacts/contact-assessment/tags")[0][1],
    );
    expect(tagBody.tags).toEqual([
      "website-lead",
      "automation-review",
      "automation-assessment",
      "assessment-confirmation-only",
    ]);

    const noteBody = requestBody(
      callsFor(fetchMock, "/contacts/contact-assessment/notes")[0][1],
    ) as { body: string; title: string };
    expect(noteBody.title).toBe(
      "Free Business Automation Assessment",
    );
    expect(noteBody.body).toContain("Assessment: TA-assessment-123");
    expect(noteBody.body).toContain("Primary challenge: Other");
    expect(noteBody.body).toContain("Monthly leads: 20");
    expect(noteBody.body).toContain(
      "See the associated Automation Assessment record",
    );
    expect(noteBody.body).not.toContain("assessment@example.com");
    expect(noteBody.body).not.toContain("First line");
    expect(noteBody.body).not.toContain("Service desk");

    for (const [, init] of fetchMock.mock.calls) {
      expect(init?.headers).toMatchObject({
        Authorization: "Bearer test-token",
        Version: "v3",
      });
    }
  });

  it("reuses the record and relation when the same assessment is retried", async () => {
    let storedProperties: Record<string, string> | undefined;
    let relationExists = false;
    const fetchMock = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);

        if (url.includes(`/objects/${testGoHighLevelSchemaKey}?`)) {
          return jsonResponse(makeGoHighLevelAssessmentSchemaResponse());
        }

        if (url.includes(`/associations/key/`)) {
          return jsonResponse(makeGoHighLevelAssessmentAssociation());
        }

        if (url.endsWith("/records/search")) {
          return jsonResponse({
            records: storedProperties
              ? [
                  {
                    id: "assessment-record",
                    properties: storedProperties,
                  },
                ]
              : [],
            total: storedProperties ? 1 : 0,
          });
        }

        if (url.endsWith("/contacts/upsert")) {
          return jsonResponse({ contact: { id: "contact-assessment" } });
        }

        if (
          url.endsWith(
            `/objects/${testGoHighLevelSchemaKey}/records`,
          )
        ) {
          storedProperties = requestBody(init).properties as Record<
            string,
            string
          >;
          return jsonResponse(
            { record: { id: "assessment-record" } },
            201,
          );
        }

        if (url.includes("/associations/relations/assessment-record?")) {
          return jsonResponse({
            relations: relationExists
              ? [
                  {
                    recordId: "contact-assessment",
                    associations: [
                      {
                        associationId: testGoHighLevelAssociationId,
                        relationId: "relation-1",
                      },
                    ],
                  },
                ]
              : [],
          });
        }

        if (url.endsWith("/associations/relations")) {
          relationExists = true;
          return jsonResponse(
            {
              id: "relation-1",
              firstObjectKey: testGoHighLevelSchemaKey,
              firstRecordId: "assessment-record",
              secondObjectKey: "contact",
              secondRecordId: "contact-assessment",
              associationId: testGoHighLevelAssociationId,
              locationId: testGoHighLevelLocationId,
            },
            201,
          );
        }

        if (
          url.includes("/contacts/contact-assessment/tags") ||
          url.includes("/contacts/contact-assessment/notes")
        ) {
          return jsonResponse({}, 201);
        }

        throw new Error(`Unexpected URL: ${url}`);
      },
    );
    vi.stubGlobal("fetch", fetchMock);
    const { sendLeadToGoHighLevel } = await import(
      "@/features/leads/gohighlevel"
    );
    const assessment = makeCompleteAssessment();

    await sendLeadToGoHighLevel(assessment);
    await sendLeadToGoHighLevel(assessment);

    const recordCreates = callsFor(
      fetchMock,
      `/objects/${testGoHighLevelSchemaKey}/records`,
    ).filter(([input]) => !String(input).endsWith("/records/search"));
    const relationCreates = callsFor(
      fetchMock,
      "/associations/relations",
    ).filter(([input]) =>
      String(input).endsWith("/associations/relations"),
    );

    expect(recordCreates).toHaveLength(1);
    expect(relationCreates).toHaveLength(1);
    expect(
      callsFor(
        fetchMock,
        `/objects/${testGoHighLevelSchemaKey}?`,
      ),
    ).toHaveLength(1);
    expect(callsFor(fetchMock, "/associations/key/")).toHaveLength(1);
  });

  it("recovers the existing record after a create conflict", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    let storedProperties: Record<string, string> | undefined;
    const fetchMock = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);

        if (url.includes(`/objects/${testGoHighLevelSchemaKey}?`)) {
          return jsonResponse(makeGoHighLevelAssessmentSchemaResponse());
        }

        if (url.includes("/associations/key/")) {
          return jsonResponse(makeGoHighLevelAssessmentAssociation());
        }

        if (url.endsWith("/records/search")) {
          return jsonResponse({
            records: storedProperties
              ? [
                  {
                    id: "assessment-record",
                    properties: storedProperties,
                  },
                ]
              : [],
            total: storedProperties ? 1 : 0,
          });
        }

        if (url.endsWith("/contacts/upsert")) {
          return jsonResponse({ contact: { id: "contact-assessment" } });
        }

        if (
          url.endsWith(
            `/objects/${testGoHighLevelSchemaKey}/records`,
          )
        ) {
          storedProperties = requestBody(init).properties as Record<
            string,
            string
          >;
          return jsonResponse(
            { message: "Assessment Reference already exists" },
            400,
          );
        }

        if (url.includes("/associations/relations/assessment-record?")) {
          return jsonResponse({ relations: [] });
        }

        if (url.endsWith("/associations/relations")) {
          return jsonResponse(
            {
              id: "relation-1",
              firstObjectKey: testGoHighLevelSchemaKey,
              firstRecordId: "assessment-record",
              secondObjectKey: "contact",
              secondRecordId: "contact-assessment",
              associationId: testGoHighLevelAssociationId,
              locationId: testGoHighLevelLocationId,
            },
            201,
          );
        }

        if (
          url.includes("/contacts/contact-assessment/tags") ||
          url.includes("/contacts/contact-assessment/notes")
        ) {
          return jsonResponse({}, 201);
        }

        throw new Error(`Unexpected URL: ${url}`);
      },
    );
    vi.stubGlobal("fetch", fetchMock);
    const { sendLeadToGoHighLevel } = await import(
      "@/features/leads/gohighlevel"
    );

    await expect(
      sendLeadToGoHighLevel(makeCompleteAssessment()),
    ).resolves.toMatchObject({ ok: true });
    expect(
      callsFor(
        fetchMock,
        `/objects/${testGoHighLevelSchemaKey}/records`,
      ).filter(([input]) => !String(input).endsWith("/records/search")),
    ).toHaveLength(1);
    expect(callsFor(fetchMock, "/records/search")).toHaveLength(2);
  });

  it("recovers record and relation writes whose success responses are lost", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    let storedProperties: Record<string, string> | undefined;
    let relationExists = false;
    const fetchMock = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);

        if (url.includes(`/objects/${testGoHighLevelSchemaKey}?`)) {
          return jsonResponse(makeGoHighLevelAssessmentSchemaResponse());
        }

        if (url.includes("/associations/key/")) {
          return jsonResponse(makeGoHighLevelAssessmentAssociation());
        }

        if (url.endsWith("/records/search")) {
          return jsonResponse({
            records: storedProperties
              ? [
                  {
                    id: "assessment-record",
                    properties: storedProperties,
                  },
                ]
              : [],
            total: storedProperties ? 1 : 0,
          });
        }

        if (url.endsWith("/contacts/upsert")) {
          return jsonResponse({ contact: { id: "contact-assessment" } });
        }

        if (
          url.endsWith(
            `/objects/${testGoHighLevelSchemaKey}/records`,
          )
        ) {
          storedProperties = requestBody(init).properties as Record<
            string,
            string
          >;
          return unreadableJsonResponse(201);
        }

        if (url.includes("/associations/relations/assessment-record?")) {
          return jsonResponse({
            relations: relationExists
              ? [
                  {
                    recordId: "contact-assessment",
                    associations: [
                      {
                        associationId: testGoHighLevelAssociationId,
                        relationId: "relation-1",
                      },
                    ],
                  },
                ]
              : [],
          });
        }

        if (url.endsWith("/associations/relations")) {
          relationExists = true;
          return unreadableJsonResponse(201);
        }

        if (
          url.includes("/contacts/contact-assessment/tags") ||
          url.includes("/contacts/contact-assessment/notes")
        ) {
          return jsonResponse({}, 201);
        }

        throw new Error(`Unexpected URL: ${url}`);
      },
    );
    vi.stubGlobal("fetch", fetchMock);
    const { sendLeadToGoHighLevel } = await import(
      "@/features/leads/gohighlevel"
    );

    await expect(
      sendLeadToGoHighLevel(makeCompleteAssessment()),
    ).resolves.toMatchObject({ ok: true });
    expect(
      callsFor(
        fetchMock,
        `/objects/${testGoHighLevelSchemaKey}/records`,
      ).filter(([input]) => !String(input).endsWith("/records/search")),
    ).toHaveLength(1);
    expect(callsFor(fetchMock, "/records/search")).toHaveLength(2);
    expect(
      callsFor(fetchMock, "/associations/relations").filter(
        ([input]) =>
          String(input).endsWith("/associations/relations"),
      ),
    ).toHaveLength(1);
    expect(
      callsFor(
        fetchMock,
        "/associations/relations/assessment-record?",
      ),
    ).toHaveLength(2);
  });

  it("recovers a persisted record and completes a relation after a partial failure", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    let storedProperties: Record<string, string> | undefined;
    let relationPostAttempts = 0;
    const fetchMock = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);

        if (url.includes(`/objects/${testGoHighLevelSchemaKey}?`)) {
          return jsonResponse(makeGoHighLevelAssessmentSchemaResponse());
        }

        if (url.includes(`/associations/key/`)) {
          return jsonResponse(makeGoHighLevelAssessmentAssociation());
        }

        if (url.endsWith("/records/search")) {
          return jsonResponse({
            records: storedProperties
              ? [
                  {
                    id: "assessment-record",
                    properties: storedProperties,
                  },
                ]
              : [],
            total: storedProperties ? 1 : 0,
          });
        }

        if (url.endsWith("/contacts/upsert")) {
          return jsonResponse({ contact: { id: "contact-assessment" } });
        }

        if (
          url.endsWith(
            `/objects/${testGoHighLevelSchemaKey}/records`,
          )
        ) {
          storedProperties = requestBody(init).properties as Record<
            string,
            string
          >;
          return jsonResponse(
            { record: { id: "assessment-record" } },
            201,
          );
        }

        if (url.includes("/associations/relations/assessment-record?")) {
          return jsonResponse({ relations: [] });
        }

        if (url.endsWith("/associations/relations")) {
          relationPostAttempts += 1;

          if (relationPostAttempts === 1) {
            return jsonResponse({ message: "temporary" }, 503);
          }

          return jsonResponse(
            {
              id: "relation-1",
              firstObjectKey: testGoHighLevelSchemaKey,
              firstRecordId: "assessment-record",
              secondObjectKey: "contact",
              secondRecordId: "contact-assessment",
              associationId: testGoHighLevelAssociationId,
              locationId: testGoHighLevelLocationId,
            },
            201,
          );
        }

        if (
          url.includes("/contacts/contact-assessment/tags") ||
          url.includes("/contacts/contact-assessment/notes")
        ) {
          return jsonResponse({}, 201);
        }

        throw new Error(`Unexpected URL: ${url}`);
      },
    );
    vi.stubGlobal("fetch", fetchMock);
    const { sendLeadToGoHighLevel } = await import(
      "@/features/leads/gohighlevel"
    );
    const assessment = makeCompleteAssessment();

    await expect(
      sendLeadToGoHighLevel(assessment),
    ).rejects.toThrow("gohighlevel-create-assessment-relation-http");
    await expect(
      sendLeadToGoHighLevel(assessment),
    ).resolves.toMatchObject({ ok: true });

    const recordCreates = callsFor(
      fetchMock,
      `/objects/${testGoHighLevelSchemaKey}/records`,
    ).filter(([input]) => !String(input).endsWith("/records/search"));
    expect(recordCreates).toHaveLength(1);
    expect(relationPostAttempts).toBe(2);
  });

  it("creates separate assessments for the same upserted Contact", async () => {
    const createdReferences: string[] = [];
    const fetchMock = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);

        if (url.includes(`/objects/${testGoHighLevelSchemaKey}?`)) {
          return jsonResponse(makeGoHighLevelAssessmentSchemaResponse());
        }

        if (url.includes(`/associations/key/`)) {
          return jsonResponse(makeGoHighLevelAssessmentAssociation());
        }

        if (url.endsWith("/records/search")) {
          return jsonResponse({ records: [], total: 0 });
        }

        if (url.endsWith("/contacts/upsert")) {
          return jsonResponse({ contact: { id: "same-contact" } });
        }

        if (
          url.endsWith(
            `/objects/${testGoHighLevelSchemaKey}/records`,
          )
        ) {
          const properties = requestBody(init).properties as Record<
            string,
            string
          >;
          createdReferences.push(
            properties[testAssessmentPropertyKeys.assessmentReference],
          );
          return jsonResponse(
            {
              record: {
                id: `assessment-record-${createdReferences.length}`,
              },
            },
            201,
          );
        }

        if (url.includes("/associations/relations/assessment-record-")) {
          return jsonResponse({ relations: [] });
        }

        if (url.endsWith("/associations/relations")) {
          const body = requestBody(init);
          return jsonResponse(
            {
              id: `relation-${createdReferences.length}`,
              firstObjectKey: testGoHighLevelSchemaKey,
              firstRecordId: body.firstRecordId,
              secondObjectKey: "contact",
              secondRecordId: "same-contact",
              associationId: testGoHighLevelAssociationId,
              locationId: testGoHighLevelLocationId,
            },
            201,
          );
        }

        if (
          url.includes("/contacts/same-contact/tags") ||
          url.includes("/contacts/same-contact/notes")
        ) {
          return jsonResponse({}, 201);
        }

        throw new Error(`Unexpected URL: ${url}`);
      },
    );
    vi.stubGlobal("fetch", fetchMock);
    const { sendLeadToGoHighLevel } = await import(
      "@/features/leads/gohighlevel"
    );

    await sendLeadToGoHighLevel(
      makeCompleteAssessment(),
    );
    await sendLeadToGoHighLevel(
      makeCompleteAssessment({ leadId: "assessment-456" }),
    );

    expect(createdReferences).toEqual([
      "TA-assessment-123",
      "TA-assessment-456",
    ]);
  });

  it("fails closed when an assessment is already related to another Contact", async () => {
    const fetchMock = vi.fn(
      async (input: RequestInfo | URL) => {
        const url = String(input);

        if (url.includes(`/objects/${testGoHighLevelSchemaKey}?`)) {
          return jsonResponse(makeGoHighLevelAssessmentSchemaResponse());
        }

        if (url.includes("/associations/key/")) {
          return jsonResponse(makeGoHighLevelAssessmentAssociation());
        }

        if (url.endsWith("/records/search")) {
          return jsonResponse({ records: [], total: 0 });
        }

        if (url.endsWith("/contacts/upsert")) {
          return jsonResponse({ contact: { id: "contact-assessment" } });
        }

        if (
          url.endsWith(
            `/objects/${testGoHighLevelSchemaKey}/records`,
          )
        ) {
          return jsonResponse(
            { record: { id: "assessment-record" } },
            201,
          );
        }

        if (url.includes("/associations/relations/assessment-record?")) {
          return jsonResponse({
            relations: [
              {
                recordId: "different-contact",
                associations: [
                  {
                    associationId: testGoHighLevelAssociationId,
                    relationId: "existing-relation",
                  },
                ],
              },
            ],
          });
        }

        throw new Error(`Unexpected URL: ${url}`);
      },
    );
    vi.stubGlobal("fetch", fetchMock);
    const { sendLeadToGoHighLevel } = await import(
      "@/features/leads/gohighlevel"
    );

    await expect(
      sendLeadToGoHighLevel(makeCompleteAssessment()),
    ).rejects.toThrow("assessment-relation-conflict");
    expect(
      callsFor(fetchMock, "/associations/relations").filter(
        ([input]) =>
          String(input).endsWith("/associations/relations"),
      ),
    ).toHaveLength(0);
    expect(callsFor(fetchMock, "/tags")).toHaveLength(0);
    expect(callsFor(fetchMock, "/notes")).toHaveLength(0);
  });

  it("fails closed on schema drift before changing Contact data", async () => {
    const schema = makeGoHighLevelAssessmentSchemaResponse();
    schema.fields = schema.fields.filter(
      (field) => field.name !== "Monthly Lead Range",
    );
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url.includes(`/objects/${testGoHighLevelSchemaKey}?`)) {
        return jsonResponse(schema);
      }

      if (url.includes(`/associations/key/`)) {
        return jsonResponse(makeGoHighLevelAssessmentAssociation());
      }

      throw new Error(`Unexpected URL: ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);
    const { sendLeadToGoHighLevel } = await import(
      "@/features/leads/gohighlevel"
    );

    await expect(
      sendLeadToGoHighLevel(makeCompleteAssessment()),
    ).rejects.toThrow("assessment-schema-field-missing");
    expect(callsFor(fetchMock, "/contacts/upsert")).toHaveLength(0);
  });

  it("fails closed when the configured association is unavailable", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url.includes(`/objects/${testGoHighLevelSchemaKey}?`)) {
        return jsonResponse(makeGoHighLevelAssessmentSchemaResponse());
      }

      if (url.includes("/associations/key/")) {
        return jsonResponse({ message: "not found" }, 404);
      }

      throw new Error(`Unexpected URL: ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);
    const { sendLeadToGoHighLevel } = await import(
      "@/features/leads/gohighlevel"
    );

    await expect(
      sendLeadToGoHighLevel(makeCompleteAssessment()),
    ).rejects.toMatchObject({
      stage: "discover-assessment-association",
      status: 404,
    });
    expect(callsFor(fetchMock, "/contacts/upsert")).toHaveLength(0);
  });
});
