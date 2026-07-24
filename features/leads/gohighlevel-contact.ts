import "server-only";

import { z } from "zod";

import {
  getProviderPhone,
  maskEmail,
  maskPhone,
  normalizeContactEmail,
  normalizeContactName,
  normalizeContactPhone,
} from "@/features/leads/contact-identity";
import {
  isAmbiguousGoHighLevelFailure,
  requestGoHighLevel,
} from "@/features/leads/gohighlevel-client";
import type { LeadRecord } from "@/features/leads/lead.types";
import { env } from "@/lib/env";

const contactSchema = z
  .object({
    id: z.string().min(1),
    locationId: z.string().min(1),
    firstName: z.string().nullish(),
    lastName: z.string().nullish(),
    email: z.string().nullish(),
    phone: z.string().nullish(),
    companyName: z.string().nullish(),
    website: z.string().nullish(),
    timezone: z.string().nullish(),
  })
  .passthrough();

const contactSearchResponseSchema = z
  .object({
    contacts: z.array(contactSchema),
    total: z.number().int().nonnegative(),
  })
  .passthrough();

const contactMutationResponseSchema = z
  .object({
    contact: contactSchema,
  })
  .passthrough();

type GoHighLevelContact = z.infer<typeof contactSchema>;

type ContactReviewFlag =
  | "submitted-email-conflicts-with-existing"
  | "submitted-phone-conflicts-with-existing";

export type ContactResolutionResult =
  | Readonly<{ status: "no_match" }>
  | Readonly<{
      status: "exact_same_contact";
      contact: GoHighLevelContact;
      reviewFlags: readonly ContactReviewFlag[];
    }>
  | Readonly<{
      status: "email_match_only";
      contact: GoHighLevelContact;
      reviewFlags: readonly ContactReviewFlag[];
    }>
  | Readonly<{
      status: "phone_match_only";
      contact: GoHighLevelContact;
      reviewFlags: readonly ContactReviewFlag[];
    }>
  | Readonly<{
      status: "conflicting_identifiers";
      emailContactIds: readonly string[];
      phoneContactIds: readonly string[];
    }>
  | Readonly<{
      status: "ambiguous_multiple_matches";
      identifier: "email" | "phone";
      contactIds: readonly string[];
    }>
  | Readonly<{ status: "provider_unavailable" }>;

export type ResolvedContact = Readonly<{
  contactId: string;
  resolution:
    | "created"
    | "exact_same_contact"
    | "email_match_only"
    | "phone_match_only";
  reviewFlags: readonly ContactReviewFlag[];
}>;

export class ContactResolutionError extends Error {
  readonly category:
    | "ambiguous_multiple_matches"
    | "conflicting_identifiers"
    | "provider_unavailable";

  constructor(category: ContactResolutionError["category"]) {
    super(`gohighlevel-contact-resolution-${category}`);
    this.name = "ContactResolutionError";
    this.category = category;
  }
}

export function isContactResolutionError(
  error: unknown,
): error is ContactResolutionError {
  return error instanceof ContactResolutionError;
}

function compactRecord(record: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(record).filter(
      ([, value]) => value !== undefined && value !== null && value !== "",
    ),
  );
}

function parseContactMutation(value: unknown) {
  const parsed = contactMutationResponseSchema.safeParse(value);

  if (!parsed.success) {
    throw new Error("gohighlevel-contact-response-invalid");
  }

  if (parsed.data.contact.locationId !== env.goHighLevelLocationId) {
    throw new Error("gohighlevel-contact-location-mismatch");
  }

  return parsed.data.contact;
}

async function searchContacts(
  leadId: string,
  field: "email" | "phone",
  value: string,
) {
  const response = await requestGoHighLevel({
    method: "POST",
    path: "/contacts/search",
    version: "v3",
    stage: "search-contacts",
    leadId,
    body: {
      locationId: env.goHighLevelLocationId,
      page: 1,
      pageLimit: 3,
      filters: [{ field, operator: "eq", value }],
    },
    expectedStatuses: [200],
    parseJson: true,
    retrySafeRead: true,
  });
  const parsed = contactSearchResponseSchema.safeParse(response);

  if (!parsed.success) {
    throw new Error("gohighlevel-contact-search-response-invalid");
  }

  const contacts = parsed.data.contacts.filter((contact) => {
    if (contact.locationId !== env.goHighLevelLocationId) {
      return false;
    }

    return field === "email"
      ? normalizeContactEmail(contact.email ?? "") ===
          normalizeContactEmail(value)
      : normalizeContactPhone(contact.phone ?? "") ===
          normalizeContactPhone(value);
  });

  return {
    contacts,
    ambiguous:
      parsed.data.total > 1 ||
      parsed.data.total > parsed.data.contacts.length ||
      contacts.length > 1,
  };
}

function getReviewFlags(
  status: "email_match_only" | "phone_match_only",
  contact: GoHighLevelContact,
  lead: LeadRecord,
) {
  const flags: ContactReviewFlag[] = [];

  if (
    status === "email_match_only" &&
    lead.phone &&
    normalizeContactPhone(contact.phone ?? "") &&
    normalizeContactPhone(contact.phone ?? "") !==
      normalizeContactPhone(lead.phone)
  ) {
    flags.push("submitted-phone-conflicts-with-existing");
  }

  if (
    status === "phone_match_only" &&
    contact.email &&
    normalizeContactEmail(contact.email) !== normalizeContactEmail(lead.email)
  ) {
    flags.push("submitted-email-conflicts-with-existing");
  }

  return flags;
}

export async function resolveContactIdentity(
  lead: LeadRecord,
): Promise<ContactResolutionResult> {
  const email = normalizeContactEmail(lead.email);
  const phone = getProviderPhone(lead.phone);

  try {
    const [emailResult, phoneResult] = await Promise.all([
      searchContacts(lead.leadId, "email", email),
      phone
        ? searchContacts(lead.leadId, "phone", phone)
        : Promise.resolve({ contacts: [], ambiguous: false }),
    ]);

    if (emailResult.ambiguous) {
      return {
        status: "ambiguous_multiple_matches",
        identifier: "email",
        contactIds: emailResult.contacts.map((contact) => contact.id),
      };
    }

    if (phoneResult.ambiguous) {
      return {
        status: "ambiguous_multiple_matches",
        identifier: "phone",
        contactIds: phoneResult.contacts.map((contact) => contact.id),
      };
    }

    const emailContact = emailResult.contacts[0];
    const phoneContact = phoneResult.contacts[0];

    if (!emailContact && !phoneContact) {
      return { status: "no_match" };
    }

    if (
      emailContact &&
      phoneContact &&
      emailContact.id !== phoneContact.id
    ) {
      return {
        status: "conflicting_identifiers",
        emailContactIds: [emailContact.id],
        phoneContactIds: [phoneContact.id],
      };
    }

    if (emailContact && phoneContact) {
      return {
        status: "exact_same_contact",
        contact: emailContact,
        reviewFlags: [],
      };
    }

    if (emailContact) {
      return {
        status: "email_match_only",
        contact: emailContact,
        reviewFlags: getReviewFlags("email_match_only", emailContact, lead),
      };
    }

    return {
      status: "phone_match_only",
      contact: phoneContact!,
      reviewFlags: getReviewFlags("phone_match_only", phoneContact!, lead),
    };
  } catch {
    return { status: "provider_unavailable" };
  }
}

function validWebsite(value: string | undefined) {
  if (!value) {
    return undefined;
  }

  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:"
      ? value
      : undefined;
  } catch {
    return undefined;
  }
}

function buildSafeContactUpdate(
  lead: LeadRecord,
  resolution: Extract<
    ContactResolutionResult,
    {
      status:
        | "exact_same_contact"
        | "email_match_only"
        | "phone_match_only";
    }
  >,
) {
  const contact = resolution.contact;
  const submittedPhone = getProviderPhone(lead.phone);
  const submittedCompany = normalizeContactName(lead.businessName);
  const submittedWebsite =
    lead.submissionType === "quick_request"
      ? validWebsite(lead.website)
      : undefined;
  const submittedTimezone = normalizeContactName(lead.timezone);
  const body = compactRecord({
    firstName: contact.firstName
      ? undefined
      : normalizeContactName(lead.firstName),
    lastName: contact.lastName
      ? undefined
      : normalizeContactName(lead.lastName),
    companyName:
      submittedCompany &&
      normalizeContactName(contact.companyName ?? undefined) !==
        submittedCompany
        ? submittedCompany
        : undefined,
    website:
      submittedWebsite && contact.website !== submittedWebsite
        ? submittedWebsite
        : undefined,
    timezone:
      submittedTimezone && contact.timezone !== submittedTimezone
        ? submittedTimezone
        : undefined,
    email:
      resolution.status === "phone_match_only" && !contact.email
        ? normalizeContactEmail(lead.email)
        : undefined,
    phone:
      resolution.status === "email_match_only" && !contact.phone
        ? submittedPhone
        : undefined,
  });

  return body;
}

async function updateResolvedContact(
  lead: LeadRecord,
  resolution: Extract<
    ContactResolutionResult,
    {
      status:
        | "exact_same_contact"
        | "email_match_only"
        | "phone_match_only";
    }
  >,
) {
  const body = buildSafeContactUpdate(lead, resolution);

  if (!Object.keys(body).length) {
    return resolution.contact;
  }

  try {
    const response = await requestGoHighLevel({
      method: "PUT",
      path: `/contacts/${encodeURIComponent(resolution.contact.id)}`,
      version: "v3",
      stage: "update-contact",
      leadId: lead.leadId,
      body,
      expectedStatuses: [200],
      parseJson: true,
    });

    return parseContactMutation(response);
  } catch (error) {
    if (isAmbiguousGoHighLevelFailure(error)) {
      return resolution.contact;
    }

    throw error;
  }
}

async function upsertNewContact(lead: LeadRecord) {
  try {
    const response = await requestGoHighLevel({
      method: "POST",
      path: "/contacts/upsert",
      version: "v3",
      stage: "upsert-contact",
      leadId: lead.leadId,
      body: compactRecord({
        firstName: normalizeContactName(lead.firstName),
        lastName: normalizeContactName(lead.lastName),
        email: normalizeContactEmail(lead.email),
        phone: getProviderPhone(lead.phone),
        companyName: normalizeContactName(lead.businessName),
        website:
          lead.submissionType === "quick_request"
            ? validWebsite(lead.website)
            : undefined,
        timezone: normalizeContactName(lead.timezone),
        source: env.goHighLevelSource,
        locationId: env.goHighLevelLocationId,
        createNewIfDuplicateAllowed: false,
      }),
      expectedStatuses: [200],
      parseJson: true,
    });

    return parseContactMutation(response);
  } catch (error) {
    if (isAmbiguousGoHighLevelFailure(error)) {
      const recovered = await resolveContactIdentity(lead);

      if (
        recovered.status === "exact_same_contact" ||
        recovered.status === "email_match_only" ||
        recovered.status === "phone_match_only"
      ) {
        return recovered.contact;
      }
    }

    throw error;
  }
}

function logResolutionFailure(
  lead: LeadRecord,
  result: Exclude<
    ContactResolutionResult,
    | { status: "no_match" }
    | {
        status:
          | "exact_same_contact"
          | "email_match_only"
          | "phone_match_only";
      }
  >,
) {
  console.warn("GoHighLevel contact resolution requires review", {
    provider: "gohighlevel",
    stage: "contact-resolution",
    leadId: lead.leadId,
    category: result.status,
    maskedEmail: maskEmail(lead.email),
    maskedPhone: maskPhone(lead.phone),
    ...("emailContactIds" in result
      ? {
          emailContactIds: result.emailContactIds,
          phoneContactIds: result.phoneContactIds,
        }
      : {}),
    ...("contactIds" in result ? { contactIds: result.contactIds } : {}),
  });
}

export async function resolveOrCreateContact(
  lead: LeadRecord,
): Promise<ResolvedContact> {
  const resolution = await resolveContactIdentity(lead);

  if (resolution.status === "no_match") {
    const contact = await upsertNewContact(lead);

    return {
      contactId: contact.id,
      resolution: "created",
      reviewFlags: [],
    };
  }

  if (
    resolution.status === "conflicting_identifiers" ||
    resolution.status === "ambiguous_multiple_matches" ||
    resolution.status === "provider_unavailable"
  ) {
    logResolutionFailure(lead, resolution);
    throw new ContactResolutionError(resolution.status);
  }

  const contact = await updateResolvedContact(lead, resolution);

  return {
    contactId: contact.id,
    resolution: resolution.status,
    reviewFlags: resolution.reviewFlags,
  };
}
