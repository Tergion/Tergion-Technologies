import { afterEach, describe, expect, it, vi } from "vitest";

import { GoHighLevelAssessmentMappingError } from "@/features/leads/gohighlevel-assessment-mapping";
import { GoHighLevelAssessmentPersistenceError } from "@/features/leads/gohighlevel-assessment";
import { ContactResolutionError } from "@/features/leads/gohighlevel-contact";
import { GoHighLevelRequestError } from "@/features/leads/gohighlevel-client";
import { logLeadProcessingFailure } from "@/features/leads/lead-diagnostics";

const baseContext = {
  stage: "sync-gohighlevel" as const,
  submissionType: "automation_assessment" as const,
  leadId: "safe-correlation-id",
};

describe("lead processing diagnostics", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each([
    [
      new GoHighLevelAssessmentMappingError(
        "assessment-schema-field-missing",
      ),
      "assessment-schema-field-missing",
    ],
    [
      new GoHighLevelAssessmentPersistenceError(
        "assessment-association-mismatch",
      ),
      "assessment-association-mismatch",
    ],
    [
      new ContactResolutionError("conflicting_identifiers"),
      "gohighlevel-contact-resolution-conflicting_identifiers",
    ],
  ])("logs trusted GoHighLevel error codes", (error, errorCode) => {
    const errorLog = vi.spyOn(console, "error").mockImplementation(() => {});

    logLeadProcessingFailure({ ...baseContext, error });

    expect(errorLog).toHaveBeenCalledWith(
      "Lead submission processing failed",
      {
        ...baseContext,
        errorCode,
        provider: "gohighlevel",
      },
    );
  });

  it("logs bounded GoHighLevel request metadata", () => {
    const errorLog = vi.spyOn(console, "error").mockImplementation(() => {});

    logLeadProcessingFailure({
      ...baseContext,
      error: new GoHighLevelRequestError({
        kind: "authorization",
        stage: "discover-assessment-schema",
        status: 403,
      }),
    });

    expect(errorLog).toHaveBeenCalledWith(
      "Lead submission processing failed",
      {
        ...baseContext,
        errorCode: "gohighlevel-request-failed",
        provider: "gohighlevel",
        providerStage: "discover-assessment-schema",
        providerStatus: 403,
        providerKind: "authorization",
      },
    );
  });

  it("allows only known internal error messages", () => {
    const errorLog = vi.spyOn(console, "error").mockImplementation(() => {});

    logLeadProcessingFailure({
      ...baseContext,
      error: new Error("gohighlevel-production-delivery-unavailable"),
    });

    expect(errorLog).toHaveBeenCalledWith(
      "Lead submission processing failed",
      {
        ...baseContext,
        errorCode: "gohighlevel-production-delivery-unavailable",
        provider: "gohighlevel",
      },
    );
  });

  it("does not log raw unexpected error details", () => {
    const privateDetail = "private-contact@example.com provider body";
    const errorLog = vi.spyOn(console, "error").mockImplementation(() => {});

    logLeadProcessingFailure({
      ...baseContext,
      error: new Error(privateDetail),
    });

    expect(errorLog).toHaveBeenCalledWith(
      "Lead submission processing failed",
      {
        ...baseContext,
        errorCode: "unexpected-error",
      },
    );
    expect(JSON.stringify(errorLog.mock.calls)).not.toContain(privateDetail);
  });
});
