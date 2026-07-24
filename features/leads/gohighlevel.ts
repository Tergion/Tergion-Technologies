import { z } from "zod";

import {
  assessmentConfirmationOnlyTag,
  automationAssessmentTag,
  biggestChallengeOptions,
  monthlyLeadRangeOptions,
} from "@/features/assessments/assessment.constants";
import { getAssessmentFollowUpPreferenceLabel } from "@/features/assessments/assessment-formatters";
import {
  persistAutomationAssessment,
  prepareAutomationAssessment,
} from "@/features/leads/gohighlevel-assessment";
import {
  isAmbiguousGoHighLevelFailure,
  requestGoHighLevel,
} from "@/features/leads/gohighlevel-client";
import { resolveOrCreateContact } from "@/features/leads/gohighlevel-contact";
import { maskEmail, maskPhone } from "@/features/leads/contact-identity";
import {
  preferredContactMethods,
  usesCrmOptions,
} from "@/features/leads/lead.constants";
import type { LeadRecord, ProviderResult } from "@/features/leads/lead.types";
import { env, hasGoHighLevelConfig } from "@/lib/env";

const goHighLevelNotesResponseSchema = z
  .object({
    notes: z.array(
      z
        .object({
          id: z.string().min(1),
          body: z.string(),
        })
        .passthrough(),
    ),
  })
  .passthrough();

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

function getOptionLabel(
  options: readonly { value: string; label: string }[],
  value: string,
) {
  return options.find((option) => option.value === value)?.label ?? value;
}

function getIdentityReviewLines(
  lead: LeadRecord,
  reviewFlags: readonly string[],
) {
  const lines: string[] = [];

  if (reviewFlags.includes("submitted-phone-conflicts-with-existing")) {
    lines.push(
      `Identity review: Submitted phone ${maskPhone(lead.phone)} differs from the existing Contact phone and was not applied.`,
    );
  }

  if (reviewFlags.includes("submitted-email-conflicts-with-existing")) {
    lines.push(
      `Identity review: Submitted email ${maskEmail(lead.email)} differs from the existing Contact email and was not applied.`,
    );
  }

  return lines;
}

function buildQuickRequestNote(
  lead: Extract<LeadRecord, { submissionType: "quick_request" }>,
  reviewFlags: readonly string[],
) {
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
    ...getIdentityReviewLines(lead, reviewFlags),
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
  assessmentReference: string,
  reviewFlags: readonly string[],
) {
  return [
    "Free Business Automation Assessment received",
    "",
    `Assessment: ${formatScalar(assessmentReference)}`,
    `Lead ID: ${lead.leadId}`,
    `Primary challenge: ${getOptionLabel(
      biggestChallengeOptions,
      lead.biggestChallenge,
    )}`,
    `Monthly leads: ${getOptionLabel(
      monthlyLeadRangeOptions,
      lead.monthlyLeadRange,
    )}`,
    `Follow-up preference: ${getAssessmentFollowUpPreferenceLabel(lead)}`,
    ...getIdentityReviewLines(lead, reviewFlags),
    "",
    "See the associated Automation Assessment record for the complete responses.",
  ].join("\n");
}

function buildLeadNote(
  lead: LeadRecord,
  assessmentReference?: string,
  reviewFlags: readonly string[] = [],
) {
  if (lead.submissionType !== "automation_assessment") {
    return buildQuickRequestNote(lead, reviewFlags);
  }

  if (!assessmentReference) {
    throw new Error("gohighlevel-assessment-reference-missing");
  }

  return buildAssessmentNote(lead, assessmentReference, reviewFlags);
}

async function addTags(contactId: string, lead: LeadRecord) {
  const tags = getLeadTags(lead);

  if (!tags.length) {
    return;
  }

  await requestGoHighLevel({
    method: "POST",
    path: `/contacts/${encodeURIComponent(contactId)}/tags`,
    version: "v3",
    stage: "add-tags",
    leadId: lead.leadId,
    body: { tags },
    expectedStatuses: [201],
  });
}

async function createNote(
  contactId: string,
  lead: LeadRecord,
  assessmentReference?: string,
  reviewFlags: readonly string[] = [],
) {
  const noteBody = buildLeadNote(lead, assessmentReference, reviewFlags);

  if (await hasSubmissionNote(contactId, lead)) {
    return;
  }

  try {
    await requestGoHighLevel({
      method: "POST",
      path: `/contacts/${encodeURIComponent(contactId)}/notes`,
      version: "v3",
      stage: "create-note",
      leadId: lead.leadId,
      body: {
        body: noteBody,
        title:
          lead.submissionType === "automation_assessment"
            ? "Free Business Automation Assessment"
            : "Website lead request",
      },
      expectedStatuses: [201],
    });
  } catch (error) {
    if (
      isAmbiguousGoHighLevelFailure(error)
    ) {
      if (await hasSubmissionNote(contactId, lead)) {
        return;
      }
    }

    throw error;
  }
}

async function hasSubmissionNote(contactId: string, lead: LeadRecord) {
  const response = await requestGoHighLevel({
    method: "GET",
    path: `/contacts/${encodeURIComponent(contactId)}/notes`,
    version: "v3",
    stage: "get-contact-notes",
    leadId: lead.leadId,
    expectedStatuses: [200],
    parseJson: true,
    retrySafeRead: true,
  });
  const parsed = goHighLevelNotesResponseSchema.safeParse(response);

  if (!parsed.success) {
    throw new Error("gohighlevel-contact-notes-response-invalid");
  }

  const marker = `Lead ID: ${lead.leadId}`;
  return parsed.data.notes.some((note) =>
    note.body.split(/\r?\n/).some((line) => line.trim() === marker),
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

  const preparedAssessment =
    lead.submissionType === "automation_assessment"
      ? await prepareAutomationAssessment(lead)
      : undefined;
  const resolvedContact = await resolveOrCreateContact(lead);
  const contactId = resolvedContact.contactId;
  const persistedAssessment = preparedAssessment
    ? await persistAutomationAssessment(
        preparedAssessment,
        contactId,
        lead.leadId,
      )
    : undefined;

  await addTags(contactId, lead);
  await createNote(
    contactId,
    lead,
    persistedAssessment?.assessmentReference,
    resolvedContact.reviewFlags,
  );

  return {
    ok: true,
    configured: true,
    provider: "gohighlevel",
    message: "Lead synced to GoHighLevel.",
  };
}
