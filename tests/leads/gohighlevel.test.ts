import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { makeLeadRecord } from "@/tests/fixtures/leads";

function setGoHighLevelEnv() {
  process.env.GHL_PRIVATE_INTEGRATION_TOKEN = "test-token";
  process.env.GHL_API_KEY = "";
  process.env.GHL_LOCATION_ID = "location-123";
  process.env.GHL_SOURCE = "Vitest source";
  process.env.GHL_LEAD_TAGS = "website-lead, automation-review";
}

function clearGoHighLevelEnv() {
  delete process.env.GHL_PRIVATE_INTEGRATION_TOKEN;
  delete process.env.GHL_API_KEY;
  delete process.env.GHL_LOCATION_ID;
  delete process.env.GHL_SOURCE;
  delete process.env.GHL_LEAD_TAGS;
}

describe("sendLeadToGoHighLevel", () => {
  beforeEach(() => {
    vi.resetModules();
    setGoHighLevelEnv();
  });

  afterEach(() => {
    clearGoHighLevelEnv();
  });

  it("upserts a contact, adds tags, and creates a note", async () => {
    const fetchMock = vi.fn(
      async (input: RequestInfo | URL, _init?: RequestInit) => {
        void _init;
        const url = String(input);

        if (url.endsWith("/contacts/upsert")) {
          return Response.json({ contact: { id: "contact-123" } });
        }

        if (url.endsWith("/contacts/contact-123/tags")) {
          return Response.json({}, { status: 201 });
        }

        if (url.endsWith("/contacts/contact-123/notes")) {
          return Response.json({}, { status: 201 });
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

    const [, upsertInit] = fetchMock.mock.calls[0];
    expect(upsertInit?.headers).toMatchObject({
      Authorization: "Bearer test-token",
      Version: "2021-07-28",
      "Content-Type": "application/json",
    });

    const upsertBody = JSON.parse(String(upsertInit?.body)) as Record<
      string,
      unknown
    >;
    expect(upsertBody).toMatchObject({
      firstName: "Test",
      lastName: "Person",
      email: "test@example.com",
      phone: "+15551234567",
      companyName: "Example Business",
      website: "https://example.com",
      timezone: "America/Los_Angeles",
      source: "Vitest source",
      locationId: "location-123",
      createNewIfDuplicateAllowed: false,
    });
    expect(upsertBody).not.toHaveProperty("notes");
    expect(upsertBody).not.toHaveProperty("honeypot");
    expect(upsertBody).not.toHaveProperty("turnstileToken");

    const [, tagInit] = fetchMock.mock.calls[1];
    expect(JSON.parse(String(tagInit?.body))).toEqual({
      tags: ["website-lead", "automation-review"],
    });

    const [, noteInit] = fetchMock.mock.calls[2];
    const noteBody = JSON.parse(String(noteInit?.body)) as { body: string };
    expect(noteBody.body).toContain("Scheduling preference: Weekdays after 5 PM");
    expect(noteBody.body).toContain("Automation interests: CRM setup, Lead follow-up");
    expect(noteBody.body).toContain("UTM source: google");
  });

  it("throws when the contact upsert fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Response.json({ message: "nope" }, { status: 401 })),
    );
    const { sendLeadToGoHighLevel } = await import(
      "@/features/leads/gohighlevel"
    );

    await expect(sendLeadToGoHighLevel(makeLeadRecord())).rejects.toThrow(
      "gohighlevel-upsert-contact-failed",
    );
  });
});
