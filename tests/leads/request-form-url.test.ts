import { describe, expect, it } from "vitest";

import {
  buildRequestFormUrl,
  canonicalRequestFormUrls,
  parseRequestFormMode,
  removeRequestFormUrl,
  serializeRequestFormMode,
} from "@/lib/request-form-url";

describe("request form URL helpers", () => {
  it("maps only canonical public values to internal request modal modes", () => {
    expect(parseRequestFormMode("quick-request")).toBe("quick_request");
    expect(parseRequestFormMode("automation-assessment")).toBe(
      "automation_assessment",
    );
    expect(parseRequestFormMode("assessment")).toBeNull();
    expect(parseRequestFormMode("quick")).toBeNull();
    expect(parseRequestFormMode("unknown")).toBeNull();
    expect(parseRequestFormMode("")).toBeNull();
    expect(parseRequestFormMode(null)).toBeNull();
  });

  it("serializes internal modes without exposing underscore values", () => {
    expect(serializeRequestFormMode("quick_request")).toBe("quick-request");
    expect(serializeRequestFormMode("automation_assessment")).toBe(
      "automation-assessment",
    );
  });

  it("builds canonical contact URLs", () => {
    expect(canonicalRequestFormUrls.quickRequest).toBe(
      "/contact?form=quick-request",
    );
    expect(canonicalRequestFormUrls.automationAssessment).toBe(
      "/contact?form=automation-assessment",
    );
  });

  it("sets or replaces only the form parameter while preserving query and hash", () => {
    expect(
      buildRequestFormUrl(
        "automation_assessment",
        "/services",
        "?utm_source=linkedin&form=quick-request&campaign=summer",
        "#pricing",
      ),
    ).toBe(
      "/services?utm_source=linkedin&form=automation-assessment&campaign=summer#pricing",
    );
  });

  it("removes only the form parameter while preserving unrelated parameters", () => {
    expect(
      removeRequestFormUrl(
        "/contact",
        "?utm_source=linkedin&form=automation-assessment&utm_campaign=q3",
      ),
    ).toBe("/contact?utm_source=linkedin&utm_campaign=q3");
  });
});
