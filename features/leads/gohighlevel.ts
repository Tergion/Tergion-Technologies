import {
  assessmentConfirmationOnlyTag,
  automationAssessmentTag,
} from "@/features/assessments/assessment.constants";
import {
  getAssessmentDetailSections,
  getAssessmentFollowUpPreferenceLabel,
} from "@/features/assessments/assessment-formatters";
import {
  preferredContactMethods,
  usesCrmOptions,
} from "@/features/leads/lead.constants";
import type { LeadRecord, ProviderResult } from "@/features/leads/lead.types";
import { env, hasGoHighLevelConfig } from "@/lib/env";

const goHighLevelBaseUrl = "https://services.leadconnectorhq.com";
const goHighLevelApiVersion = "2021-07-28";

type GoHighLevelContact = {
  id?: string;
};

type GoHighLevelUpsertResponse = {
  contact?: GoHighLevelContact;
};

type GoHighLevelRequestStage = "upsert-contact" | "add-tags" | "create-note";

function getLeadTags(lead: LeadRecord) {
  const tags = env.goHighLevelLeadTags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  if (lead.submissionType === "automation_assessment") {
    tags.push(automationAssessmentTag);

    if (lead.assessmentFollowUpPreference === "confirmation-only") {
      tags.push(assessmentConfirmationOnlyTag);
    }
  }

  return [...new Set(tags)];
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

function sanitizePlainText(value: string) {
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, " ")
    .replace(/\r\n|\r|\u2028|\u2029/g, "\n")
    .trim();
}

function formatScalar(value: string | undefined) {
  const sanitized = value ? sanitizePlainText(value) : "";
  return sanitized ? sanitized.replace(/\n+/g, " / ") : "Not provided";
}

function formatMultiline(value: string) {
  return sanitizePlainText(value)
    .split("\n")
    .map((line) => `  ${line}`)
    .join("\n");
}

function formatOptional(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value.length ? value.map(formatScalar).join(", ") : "Not provided";
  }

  return formatScalar(value);
}

function getPreferredContactLabel(value: string) {
  return (
    preferredContactMethods.find((method) => method.value === value)?.label ??
    value
  );
}

function getUsesCrmLabel(value: string) {
  return usesCrmOptions.find((option) => option.value === value)?.label ?? value;
}

function buildQuickRequestNote(lead: Extract<LeadRecord, { submissionType: "quick_request" }>) {
  return [
    "Website lead request",
    "",
    `Submission type: Quick Request`,
    `Lead ID: ${lead.leadId}`,
    `Created: ${lead.createdAt}`,
    `Business: ${formatScalar(lead.businessName)}`,
    `Preferred contact: ${getPreferredContactLabel(lead.preferredContactMethod)}`,
    `Scheduling preference: ${formatScalar(lead.schedulingPreference)}`,
    "",
    "Optional context",
    `Industry: ${formatOptional(lead.industry)}`,
    `Business size: ${formatOptional(lead.businessSize)}`,
    `Location or service area: ${formatOptional(lead.locationOrServiceArea)}`,
    `Uses CRM: ${getUsesCrmLabel(lead.usesCrm)}`,
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
    `Trigger source: ${formatOptional(lead.triggerSource)}`,
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

function buildAssessmentNote(
  lead: Extract<LeadRecord, { submissionType: "automation_assessment" }>,
) {
  const followUpPreference =
    lead.assessmentFollowUpPreference === "confirmation-only"
      ? "No follow-up beyond confirmation email"
      : getAssessmentFollowUpPreferenceLabel(lead);
  const sectionLines = getAssessmentDetailSections(lead).flatMap((section) => [
    "",
    section.title,
    ...section.details.map((detail) =>
      detail.multiline
        ? `${detail.label}:\n${formatMultiline(detail.value)}`
        : `${detail.label}: ${formatScalar(detail.value)}`,
    ),
  ]);

  return [
    "Free Business Automation Assessment",
    "",
    `Submission type: Automation Assessment`,
    `Created: ${lead.createdAt}`,
    `Assessment follow-up preference: ${followUpPreference}`,
    `Landing page: ${formatOptional(lead.landingPage)}`,
    `Trigger source: ${formatOptional(lead.triggerSource)}`,
    ...sectionLines,
    "",
    "Consent",
    `Contact consent: ${formatBoolean(lead.contactConsent)}`,
    `Privacy and terms consent: ${formatBoolean(lead.privacyTermsConsent)}`,
    `SMS consent: ${formatBoolean(lead.smsConsent)}`,
  ].join("\n");
}

function buildLeadNote(lead: LeadRecord) {
  return lead.submissionType === "automation_assessment"
    ? buildAssessmentNote(lead)
    : buildQuickRequestNote(lead);
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
      website:
        lead.submissionType === "quick_request" ? lead.website : undefined,
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
  const tags = getLeadTags(lead);

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
      title:
        lead.submissionType === "automation_assessment"
          ? "Free Business Automation Assessment"
          : "Website lead request",
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
