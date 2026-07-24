import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  makeGoHighLevelContact,
  testGoHighLevelLocationId,
} from "@/tests/fixtures/gohighlevel";
import { makeLeadRecord } from "@/tests/fixtures/leads";

function setEnvironment() {
  process.env.GHL_PRIVATE_INTEGRATION_TOKEN = "test-token";
  process.env.GHL_LOCATION_ID = testGoHighLevelLocationId;
  process.env.GHL_SOURCE = "Website";
}

function clearEnvironment() {
  delete process.env.GHL_PRIVATE_INTEGRATION_TOKEN;
  delete process.env.GHL_LOCATION_ID;
  delete process.env.GHL_SOURCE;
}

function bodyOf(init?: RequestInit) {
  return JSON.parse(String(init?.body)) as Record<string, unknown>;
}

function makeResolverFetch(options: {
  emailContacts?: ReturnType<typeof makeGoHighLevelContact>[];
  phoneContacts?: ReturnType<typeof makeGoHighLevelContact>[];
  searchFailure?: boolean;
}) {
  return vi.fn(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);

      if (url.endsWith("/contacts/search")) {
        if (options.searchFailure) {
          return Response.json({ message: "unavailable" }, { status: 503 });
        }

        const body = bodyOf(init);
        const field = (
          body.filters as Array<{ field: "email" | "phone" }>
        )[0].field;
        const contacts =
          field === "email"
            ? (options.emailContacts ?? [])
            : (options.phoneContacts ?? []);

        return Response.json({ contacts, total: contacts.length });
      }

      if (url.endsWith("/contacts/upsert")) {
        const body = bodyOf(init);
        return Response.json({
          contact: makeGoHighLevelContact({
            id: "created-contact",
            firstName: String(body.firstName ?? ""),
            lastName: String(body.lastName ?? ""),
            email: String(body.email ?? ""),
            phone: String(body.phone ?? ""),
            companyName: String(body.companyName ?? ""),
            website:
              typeof body.website === "string" ? body.website : undefined,
            timezone:
              typeof body.timezone === "string" ? body.timezone : undefined,
          }),
        });
      }

      if (init?.method === "PUT" && url.includes("/contacts/")) {
        const id = url.split("/").at(-1) ?? "contact";
        const original = [
          ...(options.emailContacts ?? []),
          ...(options.phoneContacts ?? []),
        ].find((contact) => contact.id === id);

        return Response.json({
          contact: {
            ...(original ?? makeGoHighLevelContact({ id })),
            ...bodyOf(init),
          },
        });
      }

      throw new Error(`Unexpected URL: ${url}`);
    },
  );
}

describe("GoHighLevel Contact resolution", () => {
  beforeEach(() => {
    vi.resetModules();
    setEnvironment();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    clearEnvironment();
  });

  it("creates one Contact only when neither identifier matches", async () => {
    const fetchMock = makeResolverFetch({});
    vi.stubGlobal("fetch", fetchMock);
    const { resolveOrCreateContact } = await import(
      "@/features/leads/gohighlevel-contact"
    );

    await expect(
      resolveOrCreateContact(makeLeadRecord({ phone: "+15551234567" })),
    ).resolves.toMatchObject({
      contactId: "created-contact",
      resolution: "created",
    });

    expect(
      fetchMock.mock.calls.filter(([input]) =>
        String(input).endsWith("/contacts/upsert"),
      ),
    ).toHaveLength(1);
  });

  it("reuses the same Contact when email and phone both match", async () => {
    const contact = makeGoHighLevelContact();
    const fetchMock = makeResolverFetch({
      emailContacts: [contact],
      phoneContacts: [contact],
    });
    vi.stubGlobal("fetch", fetchMock);
    const { resolveOrCreateContact } = await import(
      "@/features/leads/gohighlevel-contact"
    );

    await expect(
      resolveOrCreateContact(makeLeadRecord({ phone: contact.phone })),
    ).resolves.toMatchObject({
      contactId: contact.id,
      resolution: "exact_same_contact",
    });
    expect(
      fetchMock.mock.calls.some(([input]) =>
        String(input).endsWith("/contacts/upsert"),
      ),
    ).toBe(false);
  });

  it("fills a missing phone on an email match", async () => {
    const contact = makeGoHighLevelContact({ phone: "" });
    const fetchMock = makeResolverFetch({ emailContacts: [contact] });
    vi.stubGlobal("fetch", fetchMock);
    const { resolveOrCreateContact } = await import(
      "@/features/leads/gohighlevel-contact"
    );

    const result = await resolveOrCreateContact(
      makeLeadRecord({ phone: "+1 (555) 123-4567" }),
    );
    const update = fetchMock.mock.calls.find(
      ([input, init]) =>
        String(input).endsWith(`/contacts/${contact.id}`) &&
        init?.method === "PUT",
    );

    expect(result.resolution).toBe("email_match_only");
    expect(bodyOf(update?.[1])).toHaveProperty("phone", "+15551234567");
  });

  it("fills a missing email on a phone match", async () => {
    const contact = makeGoHighLevelContact({ email: "" });
    const fetchMock = makeResolverFetch({ phoneContacts: [contact] });
    vi.stubGlobal("fetch", fetchMock);
    const { resolveOrCreateContact } = await import(
      "@/features/leads/gohighlevel-contact"
    );

    const result = await resolveOrCreateContact(
      makeLeadRecord({ phone: contact.phone }),
    );
    const update = fetchMock.mock.calls.find(
      ([input, init]) =>
        String(input).endsWith(`/contacts/${contact.id}`) &&
        init?.method === "PUT",
    );

    expect(result.resolution).toBe("phone_match_only");
    expect(bodyOf(update?.[1])).toHaveProperty(
      "email",
      "test@example.com",
    );
  });

  it("does not overwrite a different existing phone", async () => {
    const contact = makeGoHighLevelContact({ phone: "+15550001111" });
    const fetchMock = makeResolverFetch({ emailContacts: [contact] });
    vi.stubGlobal("fetch", fetchMock);
    const { resolveOrCreateContact } = await import(
      "@/features/leads/gohighlevel-contact"
    );

    const result = await resolveOrCreateContact(
      makeLeadRecord({ phone: "+15550002222" }),
    );
    const update = fetchMock.mock.calls.find(
      ([input, init]) =>
        String(input).endsWith(`/contacts/${contact.id}`) &&
        init?.method === "PUT",
    );

    expect(result.reviewFlags).toContain(
      "submitted-phone-conflicts-with-existing",
    );
    expect(update ? bodyOf(update[1]) : {}).not.toHaveProperty("phone");
  });

  it("does not overwrite a different existing email", async () => {
    const contact = makeGoHighLevelContact({
      email: "existing@example.com",
    });
    const fetchMock = makeResolverFetch({ phoneContacts: [contact] });
    vi.stubGlobal("fetch", fetchMock);
    const { resolveOrCreateContact } = await import(
      "@/features/leads/gohighlevel-contact"
    );

    const result = await resolveOrCreateContact(
      makeLeadRecord({ phone: contact.phone }),
    );
    const update = fetchMock.mock.calls.find(
      ([input, init]) =>
        String(input).endsWith(`/contacts/${contact.id}`) &&
        init?.method === "PUT",
    );

    expect(result.reviewFlags).toContain(
      "submitted-email-conflicts-with-existing",
    );
    expect(update ? bodyOf(update[1]) : {}).not.toHaveProperty("email");
  });

  it("never sends blank optional fields that could clear Contact data", async () => {
    const contact = makeGoHighLevelContact();
    const fetchMock = makeResolverFetch({ emailContacts: [contact] });
    vi.stubGlobal("fetch", fetchMock);
    const { resolveOrCreateContact } = await import(
      "@/features/leads/gohighlevel-contact"
    );

    await resolveOrCreateContact(
      makeLeadRecord({
        phone: undefined,
        lastName: undefined,
        website: undefined,
        timezone: undefined,
      }),
    );
    const update = fetchMock.mock.calls.find(
      ([input, init]) =>
        String(input).endsWith(`/contacts/${contact.id}`) &&
        init?.method === "PUT",
    );

    expect(update).toBeUndefined();
  });

  it("fails closed when email and phone resolve to different Contacts", async () => {
    const fetchMock = makeResolverFetch({
      emailContacts: [makeGoHighLevelContact({ id: "contact-email" })],
      phoneContacts: [makeGoHighLevelContact({ id: "contact-phone" })],
    });
    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const { resolveOrCreateContact } = await import(
      "@/features/leads/gohighlevel-contact"
    );

    await expect(
      resolveOrCreateContact(makeLeadRecord({ phone: "+15551234567" })),
    ).rejects.toMatchObject({ category: "conflicting_identifiers" });
    expect(
      fetchMock.mock.calls.some(([, init]) => init?.method === "PUT"),
    ).toBe(false);
    expect(
      fetchMock.mock.calls.some(([input]) =>
        String(input).endsWith("/contacts/upsert"),
      ),
    ).toBe(false);
  });

  it.each(["email", "phone"] as const)(
    "fails closed for multiple %s matches",
    async (identifier) => {
      const contacts = [
        makeGoHighLevelContact({ id: `${identifier}-one` }),
        makeGoHighLevelContact({ id: `${identifier}-two` }),
      ];
      const fetchMock = makeResolverFetch(
        identifier === "email"
          ? { emailContacts: contacts }
          : { phoneContacts: contacts },
      );
      vi.stubGlobal("fetch", fetchMock);
      vi.spyOn(console, "warn").mockImplementation(() => {});
      const { resolveOrCreateContact } = await import(
        "@/features/leads/gohighlevel-contact"
      );

      await expect(
        resolveOrCreateContact(
          makeLeadRecord({ phone: "+15551234567" }),
        ),
      ).rejects.toMatchObject({
        category: "ambiguous_multiple_matches",
      });
    },
  );

  it("returns a typed provider unavailable result for search failure", async () => {
    const fetchMock = makeResolverFetch({ searchFailure: true });
    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { resolveContactIdentity } = await import(
      "@/features/leads/gohighlevel-contact"
    );

    await expect(
      resolveContactIdentity(makeLeadRecord({ phone: "+15551234567" })),
    ).resolves.toEqual({ status: "provider_unavailable" });
  });

  it("recovers a Contact created before an upsert response is lost", async () => {
    const created = makeGoHighLevelContact({ id: "recovered-contact" });
    let searchRound = 0;
    let upsertAttempts = 0;
    const fetchMock = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);

        if (url.endsWith("/contacts/search")) {
          searchRound += 1;
          const contacts = searchRound <= 2 ? [] : [created];
          return Response.json({ contacts, total: contacts.length });
        }

        if (url.endsWith("/contacts/upsert")) {
          upsertAttempts += 1;
          throw new TypeError("connection reset after write");
        }

        throw new Error(`Unexpected URL: ${url} ${init?.method}`);
      },
    );
    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { resolveOrCreateContact } = await import(
      "@/features/leads/gohighlevel-contact"
    );

    await expect(
      resolveOrCreateContact(makeLeadRecord({ phone: created.phone })),
    ).resolves.toMatchObject({
      contactId: "recovered-contact",
      resolution: "created",
    });
    expect(upsertAttempts).toBe(1);
  });

  it("continues with the known Contact when a safe update response is lost", async () => {
    const contact = makeGoHighLevelContact({
      phone: "",
      companyName: "Old Company",
    });
    const fetchMock = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);

        if (url.endsWith("/contacts/search")) {
          const field = (
            bodyOf(init).filters as Array<{ field: "email" | "phone" }>
          )[0].field;
          const contacts = field === "email" ? [contact] : [];
          return Response.json({ contacts, total: contacts.length });
        }

        if (
          url.endsWith(`/contacts/${contact.id}`) &&
          init?.method === "PUT"
        ) {
          throw new TypeError("connection reset after update");
        }

        throw new Error(`Unexpected URL: ${url}`);
      },
    );
    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { resolveOrCreateContact } = await import(
      "@/features/leads/gohighlevel-contact"
    );

    await expect(
      resolveOrCreateContact(
        makeLeadRecord({ phone: "+15551234567" }),
      ),
    ).resolves.toMatchObject({
      contactId: contact.id,
      resolution: "email_match_only",
    });
  });
});
