import { env, hasGoHighLevelConfig } from "@/lib/env";
import type { LeadRecord, ProviderResult } from "@/features/leads/lead.types";

const goHighLevelBaseUrl = "https://services.leadconnectorhq.com";
const goHighLevelApiVersion = "2021-07-28";

type GoHighLevelContact = {
  id?: string;
};

type GoHighLevelUpsertResponse = {
  contact?: GoHighLevelContact;
};

type GoHighLevelRequestStage = "upsert-contact" | "add-tags" | "create-note";

function getLeadTags() {
  return env.goHighLevelLeadTags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function compactRecord<T extends Record<string, unknown>>(record: T) {
  return Object.fromEntries(
    Object.entries(record).filter(
      ([, value]) => value !== undefined && value !== null && value !== "",
    ),
  );
}

function formatBoolean(value: boolean) {
  return value ? "Yes" : "No";
}

function formatOptional(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value.length ? value.join(", ") : "Not provided";
  }

  return value || "Not provided";
}

function buildLeadNote(lead: LeadRecord) {
  return [
    "Website lead request",
    "",
    `Lead ID: ${lead.leadId}`,
    `Created: ${lead.createdAt}`,
    `Business: ${lead.businessName}`,
    `Preferred contact: ${lead.preferredContactMethod}`,
    `Scheduling preference: ${lead.schedulingPreference}`,
    "",
    "Optional context",
    `Industry: ${formatOptional(lead.industry)}`,
    `Business size: ${formatOptional(lead.businessSize)}`,
    `Location or service area: ${formatOptional(lead.locationOrServiceArea)}`,
    `Uses CRM: ${lead.usesCrm}`,
    `Current CRM: ${formatOptional(lead.currentCrm)}`,
    `Automation interests: ${formatOptional(lead.automationInterests)}`,
    `Request priority: ${formatOptional(lead.requestPriority)}`,
    `Website: ${formatOptional(lead.website)}`,
    `Notes: ${formatOptional(lead.notes)}`,
    "",
    "Consent",
    `Contact consent: ${formatBoolean(lead.contactConsent)}`,
    `Privacy and terms consent: ${formatBoolean(lead.privacyTermsConsent)}`,
    `SMS consent: ${formatBoolean(lead.smsConsent)}`,
    `AI disclosure seen: ${formatBoolean(lead.aiDisclosureSeen)}`,
    "",
    "Attribution",
    `Landing page: ${formatOptional(lead.landingPage)}`,
    `Referrer: ${formatOptional(lead.referrer)}`,
    `Timezone: ${formatOptional(lead.timezone)}`,
    `UTM source: ${formatOptional(lead.utmSource)}`,
    `UTM medium: ${formatOptional(lead.utmMedium)}`,
    `UTM campaign: ${formatOptional(lead.utmCampaign)}`,
    `UTM content: ${formatOptional(lead.utmContent)}`,
    "",
    "Security summary",
    `Turnstile configured: ${formatBoolean(lead.security.turnstileConfigured)}`,
    `Turnstile verified: ${formatBoolean(lead.security.turnstileVerified)}`,
    `Duplicate likely: ${formatBoolean(lead.security.duplicateLikely)}`,
    `Spam score: ${lead.security.spamScore}`,
  ].join("\n");
}

function logGoHighLevelFailure(
  lead: LeadRecord,
  stage: GoHighLevelRequestStage,
  status?: number,
) {
  console.error("GoHighLevel lead sync failed", {
    provider: "gohighlevel",
    stage,
    status,
    leadId: lead.leadId,
  });
}

async function postToGoHighLevel<TResponse>(
  path: string,
  body: Record<string, unknown>,
  lead: LeadRecord,
  stage: GoHighLevelRequestStage,
) {
  const response = await fetch(`${goHighLevelBaseUrl}${path}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${env.goHighLevelToken}`,
      "Content-Type": "application/json",
      Version: goHighLevelApiVersion,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    logGoHighLevelFailure(lead, stage, response.status);
    throw new Error(`gohighlevel-${stage}-failed`);
  }

  try {
    return (await response.json()) as TResponse;
  } catch {
    return undefined as TResponse;
  }
}

function getContactId(response: GoHighLevelUpsertResponse | undefined) {
  return response?.contact?.id;
}

async function upsertContact(lead: LeadRecord) {
  return postToGoHighLevel<GoHighLevelUpsertResponse>(
    "/contacts/upsert",
    compactRecord({
      firstName: lead.firstName,
      lastName: lead.lastName,
      email: lead.email,
      phone: lead.phone,
      companyName: lead.businessName,
      website: lead.website,
      timezone: lead.timezone,
      source: env.goHighLevelSource,
      locationId: env.goHighLevelLocationId,
      createNewIfDuplicateAllowed: false,
    }),
    lead,
    "upsert-contact",
  );
}

async function addTags(contactId: string, lead: LeadRecord) {
  const tags = getLeadTags();

  if (!tags.length) {
    return;
  }

  await postToGoHighLevel(
    `/contacts/${encodeURIComponent(contactId)}/tags`,
    { tags },
    lead,
    "add-tags",
  );
}

async function createNote(contactId: string, lead: LeadRecord) {
  await postToGoHighLevel(
    `/contacts/${encodeURIComponent(contactId)}/notes`,
    {
      body: buildLeadNote(lead),
      title: "Website lead request",
    },
    lead,
    "create-note",
  );
}

export async function sendLeadToGoHighLevel(
  lead: LeadRecord,
): Promise<ProviderResult> {
  if (!hasGoHighLevelConfig()) {
    return {
      ok: true,
      configured: false,
      provider: "gohighlevel",
      message:
        "Development stub: GoHighLevel credentials are not configured.",
    };
  }

  const upsertResponse = await upsertContact(lead);
  const contactId = getContactId(upsertResponse);

  if (!contactId) {
    logGoHighLevelFailure(lead, "upsert-contact");
    throw new Error("gohighlevel-contact-id-missing");
  }

  await addTags(contactId, lead);
  await createNote(contactId, lead);

  return {
    ok: true,
    configured: true,
    provider: "gohighlevel",
    message: "Lead synced to GoHighLevel.",
  };
}
