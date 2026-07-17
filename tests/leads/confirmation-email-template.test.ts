import { describe, expect, it } from "vitest";

import {
  confirmationEmailPreheader,
  confirmationEmailSubject,
  renderConfirmationEmailHtml,
  renderConfirmationEmailText,
} from "@/features/leads/confirmation-email-template";
import { makeLeadRecord } from "@/tests/fixtures/leads";

describe("confirmation email template", () => {
  it("renders the approved subject, preheader, required details, and absolute links", () => {
    const lead = makeLeadRecord();
    const html = renderConfirmationEmailHtml(lead);
    const text = renderConfirmationEmailText(lead);

    expect(confirmationEmailSubject).toBe("We received your Tergion request");
    expect(confirmationEmailPreheader).toBe(
      "We’ll review your request and follow up based on your preferred contact method.",
    );
    expect(html).toContain("Request received");
    expect(html).toContain("Example Business");
    expect(html).toContain("Weekdays after 5 PM");
    expect(html).toContain(
      'src="https://tergion.com/logos/tergion_logo_blue_text.png"',
    );
    expect(html).not.toContain("/public/");
    expect(html).toContain('href="https://tergion.com/privacy"');
    expect(html).toContain('href="https://tergion.com/terms"');
    expect(html).toContain('href="https://tergion.com/data-notice"');
    expect(text).toContain("Name: Test");
    expect(text).toContain("Preferred contact method: Email");
    expect(text).toContain("Privacy Policy: https://tergion.com/privacy");
    expect(text).toContain(
      "Replies to noreply@tergion.com are not monitored.",
    );
    expect(html).toContain("Replies to this mailbox are not monitored.");
  });

  it("omits empty optional details", () => {
    const html = renderConfirmationEmailHtml(makeLeadRecord());

    expect(html).not.toContain(">Phone<");
    expect(html).not.toContain(">Website<");
    expect(html).not.toContain(">CRM use<");
    expect(html).not.toContain(">Current CRM<");
    expect(html).not.toContain(">Priority<");
    expect(html).not.toContain(">Automation interests<");
    expect(html).not.toContain(">Notes<");
  });

  it("renders meaningful optional details with human-readable labels", () => {
    const html = renderConfirmationEmailHtml(
      makeLeadRecord({
        lastName: "Person",
        phone: "+1 555 123 4567",
        website: "https://example.com",
        usesCrm: "yes",
        currentCrm: "HubSpot",
        requestPriority: "Soon",
        automationInterests: ["CRM setup", "Lead follow-up"],
        notes: "Line one\nLine two",
      }),
    );

    expect(html).toContain("Test Person");
    expect(html).toContain(">Phone<");
    expect(html).toContain("+1 555 123 4567");
    expect(html).toContain(">Website<");
    expect(html).toContain(">CRM use<");
    expect(html).toContain(">Yes<");
    expect(html).toContain("HubSpot");
    expect(html).toContain("CRM setup, Lead follow-up");
    expect(html).toContain("Line one<br>Line two");
  });

  it("escapes user values and excludes internal lead data", () => {
    const lead = makeLeadRecord({
      firstName: '<script>alert("name")</script>',
      businessName: "A & B <Systems>",
      schedulingPreference: 'After "five" & before six',
      notes: "First line\nSecond <line> & 'quote'",
      leadId: "internal-lead-secret",
      utmSource: "internal-attribution-secret",
      security: {
        turnstileVerified: true,
        turnstileConfigured: true,
        spamScore: 10,
        spamReasons: ["internal-security-secret"],
        duplicateLikely: false,
      },
    });
    const html = renderConfirmationEmailHtml(lead);
    const text = renderConfirmationEmailText(lead);

    expect(html).not.toContain("<script>alert");
    expect(html).toContain(
      "&lt;script&gt;alert(&quot;name&quot;)&lt;/script&gt;",
    );
    expect(html).toContain("A &amp; B &lt;Systems&gt;");
    expect(html).toContain("First line<br>Second &lt;line&gt; &amp; &#39;quote&#39;");
    expect(html).not.toContain("internal-lead-secret");
    expect(html).not.toContain("internal-attribution-secret");
    expect(html).not.toContain("internal-security-secret");
    expect(text).not.toContain("internal-lead-secret");
    expect(text).not.toContain("internal-attribution-secret");
    expect(text).not.toContain("internal-security-secret");
    expect(html).not.toMatch(/undefined|null/);
    expect(text).not.toMatch(/undefined|null/);
  });

  it("safely renders notes at the existing schema limit", () => {
    const notes = "x".repeat(1_200);
    const html = renderConfirmationEmailHtml(makeLeadRecord({ notes }));
    const text = renderConfirmationEmailText(makeLeadRecord({ notes }));

    expect(html).toContain(notes);
    expect(text).toContain(notes);
  });
});
