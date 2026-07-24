import { describe, expect, it } from "vitest";

import {
  assessmentConfirmationEmailSubject,
  renderAssessmentConfirmationEmailHtml,
  renderAssessmentConfirmationEmailText,
} from "@/features/assessments/assessment-confirmation-email-template";
import { makeAssessmentRecord } from "@/tests/fixtures/leads";

describe("automation assessment confirmation email", () => {
  it("uses the approved subject and human-readable answer labels", () => {
    const lead = makeAssessmentRecord({
      customerValueRange: "1000-to-5000",
      schedulingPreference: "Email first",
    });
    const html = renderAssessmentConfirmationEmailHtml(lead);
    const text = renderAssessmentConfirmationEmailText(lead);

    expect(assessmentConfirmationEmailSubject).toBe(
      "We received your automation assessment!",
    );
    expect(html).toContain("A person reviews submitted assessments");
    expect(html).toContain("$1,000");
    expect(html).not.toContain("1000-to-5000");
    expect(text).toContain("Follow-up preference:");
    expect(text).toContain("No obligation. No pressure.");
    expect(html).not.toMatch(/Score:\s*\d/i);
    expect(html).not.toMatch(/ROI|guaranteed savings|guaranteed lead growth/i);
  });

  it("omits absent optional answers and escapes user values", () => {
    const html = renderAssessmentConfirmationEmailHtml(
      makeAssessmentRecord({
        firstName: '<script>alert("x")</script>',
        businessName: "A & B <Systems>",
        additionalNotes: undefined,
      }),
    );

    expect(html).not.toContain("<script>alert");
    expect(html).toContain(
      "&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;",
    );
    expect(html).toContain("A &amp; B &lt;Systems&gt;");
    expect(html).not.toContain("Additional notes");
  });

  it("enforces confirmation-only copy", () => {
    const lead = makeAssessmentRecord({
      assessmentFollowUpPreference: "confirmation-only",
    });
    const html = renderAssessmentConfirmationEmailHtml(lead);
    const text = renderAssessmentConfirmationEmailText(lead);

    for (const output of [html, text]) {
      expect(output).toContain("no follow-up beyond this confirmation email");
      expect(output).toContain(
        "will not initiate additional review or sales follow-up unless you contact us again",
      );
    }
  });

  it("uses information-first copy without promising a scheduled review", () => {
    const text = renderAssessmentConfirmationEmailText(
      makeAssessmentRecord({
        assessmentFollowUpPreference: "information-first",
      }),
    );

    expect(text).toContain("may provide introductory information");
    expect(text).toContain("No appointment or review has been scheduled.");
  });
});
