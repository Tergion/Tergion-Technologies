import "server-only";

import {
  automationAssessmentFieldContract,
  GoHighLevelAssessmentMappingError,
  type GoHighLevelAssessmentMappingErrorContext,
} from "@/features/leads/gohighlevel-assessment-mapping";
import { GoHighLevelAssessmentPersistenceError } from "@/features/leads/gohighlevel-assessment";
import { ContactResolutionError } from "@/features/leads/gohighlevel-contact";
import { GoHighLevelRequestError } from "@/features/leads/gohighlevel-client";
import type { LeadRecord } from "@/features/leads/lead.types";

export type LeadProcessingStage =
  | "check-gohighlevel-completion"
  | "sync-gohighlevel"
  | "commit-gohighlevel-submission"
  | "append-google-sheet"
  | "send-internal-notification"
  | "mark-submission-completed";

const safeInternalErrorCodes = new Set([
  "gohighlevel-production-delivery-unavailable",
  "lead-reservation-response-invalid",
  "lead-reservation-commit-failed",
  "lead-completion-response-invalid",
  "lead-completion-write-failed",
  "gohighlevel-contact-response-invalid",
  "gohighlevel-contact-location-mismatch",
  "gohighlevel-contact-search-response-invalid",
  "gohighlevel-assessment-reference-missing",
  "gohighlevel-contact-notes-response-invalid",
  "upstash-response-too-large",
  "upstash-not-configured",
  "upstash-request-failed",
  "upstash-unexpected-response",
]);

type SafeFailureDetails = {
  errorCode: string;
  provider?: "gohighlevel";
  providerStage?: GoHighLevelRequestError["stage"];
  providerStatus?: number;
  providerKind?: GoHighLevelRequestError["kind"];
  fieldId?: GoHighLevelAssessmentMappingErrorContext["fieldId"];
  fieldLabel?: string;
  expectedOptionLabel?: string;
};

function getTrustedMappingContext(
  context: GoHighLevelAssessmentMappingError["context"],
) {
  if (!context) {
    return {};
  }

  const contract = automationAssessmentFieldContract[context.fieldId];

  if (
    !contract ||
    contract.label !== context.fieldLabel ||
    !("options" in contract) ||
    !contract.options.some(
      (option) => option.label === context.expectedOptionLabel,
    )
  ) {
    return {};
  }

  return {
    fieldId: context.fieldId,
    fieldLabel: context.fieldLabel,
    expectedOptionLabel: context.expectedOptionLabel,
  };
}

function classifyLeadProcessingFailure(error: unknown): SafeFailureDetails {
  if (error instanceof GoHighLevelAssessmentMappingError) {
    return {
      errorCode: error.code,
      provider: "gohighlevel",
      ...getTrustedMappingContext(error.context),
    };
  }

  if (error instanceof GoHighLevelAssessmentPersistenceError) {
    return { errorCode: error.code, provider: "gohighlevel" };
  }

  if (error instanceof GoHighLevelRequestError) {
    return {
      errorCode: "gohighlevel-request-failed",
      provider: "gohighlevel",
      providerStage: error.stage,
      providerStatus: error.status,
      providerKind: error.kind,
    };
  }

  if (error instanceof ContactResolutionError) {
    return {
      errorCode: `gohighlevel-contact-resolution-${error.category}`,
      provider: "gohighlevel",
    };
  }

  if (error instanceof Error && safeInternalErrorCodes.has(error.message)) {
    return {
      errorCode: error.message,
      ...(error.message.startsWith("gohighlevel-")
        ? { provider: "gohighlevel" as const }
        : {}),
    };
  }

  return { errorCode: "unexpected-error" };
}

export function logLeadProcessingFailure(args: {
  error: unknown;
  stage: LeadProcessingStage;
  submissionType: LeadRecord["submissionType"];
  leadId: string;
}) {
  const details = classifyLeadProcessingFailure(args.error);

  console.error("Lead submission processing failed", {
    stage: args.stage,
    errorCode: details.errorCode,
    submissionType: args.submissionType,
    leadId: args.leadId,
    ...(details.provider ? { provider: details.provider } : {}),
    ...(details.providerStage
      ? { providerStage: details.providerStage }
      : {}),
    ...(details.providerStatus !== undefined
      ? { providerStatus: details.providerStatus }
      : {}),
    ...(details.providerKind
      ? { providerKind: details.providerKind }
      : {}),
    ...(details.fieldId ? { fieldId: details.fieldId } : {}),
    ...(details.fieldLabel ? { fieldLabel: details.fieldLabel } : {}),
    ...(details.expectedOptionLabel
      ? { expectedOptionLabel: details.expectedOptionLabel }
      : {}),
  });
}
