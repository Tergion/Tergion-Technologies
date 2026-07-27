import { describe, expect, it } from "vitest";

import { legalPages } from "@/features/legal/legal-content";

function sectionHeadings(page: keyof typeof legalPages) {
  return legalPages[page].sections.map((section) => section.heading);
}

function pageText(page: keyof typeof legalPages) {
  const content = legalPages[page];

  return [
    content.intro,
    ...content.sections.flatMap((section) => [
      section.heading,
      ...(section.body ?? []),
      ...(section.items ?? []).flatMap((item) => [
        item.label ?? "",
        item.text,
      ]),
    ]),
  ].join(" ");
}

describe("public legal content", () => {
  it("covers every required Website Terms topic", () => {
    expect(sectionHeadings("terms")).toEqual(
      expect.arrayContaining([
        "Website Use and No Client Relationship",
        "Requests, Assessments, and User Submissions",
        "User Representations and Authority",
        "Prohibited Conduct",
        "No Guaranteed Outcomes",
        "AI-Assisted Tools and Limitations",
        "Third-Party Services",
        "Disclaimer of Warranties",
        "Limitation of Liability",
        "Indemnification",
        "Governing Law and Dispute Resolution",
        "Suspension or Termination",
        "Severability",
        "Waiver",
        "Assignment",
        "Changes to the Terms",
        "Entire Agreement for Website Use",
      ]),
    );

    const terms = pageText("terms");

    expect(terms).toMatch(/maximum extent permitted by applicable law/i);
    expect(terms).toMatch(/lost profits/i);
    expect(terms).toMatch(/lost revenue/i);
    expect(terms).toMatch(/lost data/i);
    expect(terms).toMatch(/loss of goodwill/i);
    expect(terms).toMatch(/reputational harm/i);
    expect(terms).toMatch(/business interruption/i);
    expect(terms).toMatch(/replacement products or services/i);
    expect(terms).toMatch(/third-party claims/i);
    expect(terms).toMatch(/gross negligence/i);
    expect(terms).toMatch(/signed client contract/i);
    expect(terms).toMatch(/proper venue under applicable law/i);
  });

  it("covers every required Privacy Policy topic", () => {
    expect(sectionHeadings("privacy")).toEqual(
      expect.arrayContaining([
        "Categories of Information Collected",
        "Quick Request Information",
        "Automation Assessment Information",
        "Technical and Security Information",
        "Purposes of Processing",
        "Purpose Limitation",
        "Service Providers and Disclosures",
        "Sale and Advertising Disclosures",
        "Retention",
        "Deletion and Privacy Requests",
        "Security",
        "International Users",
        "Children's Privacy",
        "Changes",
      ]),
    );

    const privacy = pageText("privacy");

    expect(privacy).toMatch(/materially different purpose/i);
    expect(privacy).toMatch(/Automation Assessment Custom Object/i);
    expect(privacy).toMatch(/opt-out, and suppression records/i);
    expect(privacy).toMatch(/normal backup, restoration, and deletion cycles/i);
    expect(privacy).not.toMatch(/not be retained longer than 24 months/i);
  });

  it("keeps the notice at collection implementation-aligned", () => {
    const notice = pageText("data-notice");

    expect(notice).toMatch(/Quick Request information/i);
    expect(notice).toMatch(/Automation Assessment answers/i);
    expect(notice).toMatch(/Principal Provider Categories/i);
    expect(notice).toMatch(/does not sell personal information/i);
    expect(notice).toMatch(/cross-context behavioral advertising/i);
    expect(notice).toMatch(/provider retention and restoration cycles/i);
    expect(legalPages["data-notice"].contact.email).toBe(
      legalPages.privacy.contact.email,
    );
  });
});
