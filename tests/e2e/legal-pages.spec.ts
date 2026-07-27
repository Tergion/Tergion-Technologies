import { expect, test } from "@playwright/test";

const legalPages = [
  {
    path: "/terms",
    title: "Terms of Use",
    headings: [
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
      "Contact",
    ],
  },
  {
    path: "/privacy",
    title: "Privacy Policy",
    headings: [
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
      "Privacy Contact",
    ],
  },
  {
    path: "/data-notice",
    title: "Data Notice",
    headings: [
      "What We Collect",
      "Why We Collect It",
      "Principal Provider Categories",
      "Sale or Sharing for Advertising",
      "How Long We Keep It",
      "Your Choices and Contact",
      "Privacy Contact",
    ],
  },
] as const;

test("renders the required legal sections without browser errors", async ({
  page,
}) => {
  const consoleErrors: string[] = [];

  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });

  for (const legalPage of legalPages) {
    await page.goto(legalPage.path);
    const article = page.locator("article");

    await expect(
      article.getByRole("heading", { level: 1, name: legalPage.title }),
    ).toBeVisible();
    await expect(article.getByText("July 26, 2026")).toBeVisible();

    for (const heading of legalPage.headings) {
      await expect(
        article.getByRole("heading", {
          level: 2,
          name: heading,
          exact: true,
        }),
      ).toBeVisible();
    }
  }

  expect(consoleErrors).toEqual([]);
});

test("keeps the revised legal pages within a mobile viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });

  for (const legalPage of legalPages) {
    await page.goto(legalPage.path);
    const fitsViewport = await page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth + 1,
    );

    expect(fitsViewport, `${legalPage.path} should not overflow`).toBe(true);
  }
});
