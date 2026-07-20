import { expect, test } from "@playwright/test";

async function openLeadForm(page: import("@playwright/test").Page) {
  await page.goto("/contact");
  await page.getByRole("button", { name: "Start with the basics" }).click();

  return page.getByRole("dialog", {
    name: "Request a free automation review",
  });
}

async function completeContactStep(
  dialog: import("@playwright/test").Locator,
  overrides: { contactMethod?: "Email" | "Phone" | "Text" | "No preference" } = {},
) {
  await dialog.getByLabel("First name *").fill("Playwright");
  await dialog.getByLabel("Business name *").fill("Example Business");
  await dialog.getByLabel("Email *").fill("playwright@example.com");
  await dialog.getByLabel("Scheduling preference *").fill("Weekdays after 5 PM");

  if (overrides.contactMethod) {
    await dialog.getByRole("button", { name: overrides.contactMethod }).click();
  }
}

test("submits the existing lead form successfully", async ({ page }) => {
  await page.route("**/api/leads", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        message:
          "Thanks. We received your request. We'll review your information and follow up based on your preferred contact method. No obligation, no pressure.",
        leadId: "playwright-lead",
      }),
    });
  });
  const dialog = await openLeadForm(page);

  await completeContactStep(dialog);
  await dialog.getByRole("button", { name: "Continue" }).click();
  await dialog.getByRole("button", { name: "CRM setup" }).click();
  await dialog.getByRole("button", { name: "Continue" }).click();
  await dialog.getByLabel(/I agree to be contacted/).check();
  await dialog.getByLabel(/I agree to the/).check();

  await dialog.getByRole("button", { name: "Start the request" }).click();

  await expect(dialog.getByText("Submitting your request")).toBeVisible();
  const progressTrack = dialog.locator('[role="progressbar"]');
  await expect(
    dialog.getByRole("progressbar", { name: "Submitting request" }),
  ).toBeVisible();
  const loadingTrackBox = await progressTrack.boundingBox();

  expect(loadingTrackBox).not.toBeNull();
  await expect(
    dialog.getByRole("img", { name: "Submission complete" }),
  ).not.toBeVisible();
  await expect(dialog.getByText("Request received")).toBeVisible();
  await expect(
    dialog.getByRole("progressbar", { name: "Request submitted" }),
  ).toHaveAttribute("aria-valuenow", "100");
  await expect(
    dialog.getByRole("img", { name: "Submission complete" }),
  ).toBeVisible();
  const completedTrackBox = await progressTrack.boundingBox();

  expect(completedTrackBox).not.toBeNull();
  expect(completedTrackBox?.x).toBeCloseTo(loadingTrackBox?.x ?? 0, 1);
  expect(completedTrackBox?.width).toBeCloseTo(
    loadingTrackBox?.width ?? 0,
    1,
  );
  await expect(
    dialog.getByText(
      "Thanks. We received your request. We'll review your information and follow up based on your preferred contact method. No obligation, no pressure.",
    ),
  ).toBeVisible();
});

test("shows validation for missing required contact fields", async ({ page }) => {
  const dialog = await openLeadForm(page);

  await dialog.getByRole("button", { name: "Continue" }).click();

  await expect(dialog.getByText("First name is required.")).toBeVisible();
  await expect(dialog.getByText("Business name is required.")).toBeVisible();
  await expect(dialog.getByText("Email is required.")).toBeVisible();
  await expect(
    dialog.getByText("Scheduling preference is required."),
  ).toBeVisible();
});

test("clears only a corrected field error once that field is valid", async ({
  page,
}) => {
  const dialog = await openLeadForm(page);

  await dialog.getByRole("button", { name: "Continue" }).click();

  const firstNameError = dialog.getByText("First name is required.");
  const businessNameError = dialog.getByText("Business name is required.");
  const emailRequiredError = dialog.getByText("Email is required.");
  const emailInvalidError = dialog.getByText("Enter a valid email address.");

  await dialog.getByLabel("First name *").fill("P");
  await expect(firstNameError).not.toBeVisible();
  await expect(businessNameError).toBeVisible();

  await dialog.getByLabel("Email *").fill("not-an-email");
  await expect(emailRequiredError).not.toBeVisible();
  await expect(emailInvalidError).toBeVisible();
  await expect(businessNameError).toBeVisible();

  await dialog.getByLabel("Email *").fill("person@example.com");
  await expect(emailInvalidError).not.toBeVisible();
  await expect(businessNameError).toBeVisible();
});

test("requires phone when text is the preferred contact method", async ({
  page,
}) => {
  const dialog = await openLeadForm(page);

  await completeContactStep(dialog, { contactMethod: "Text" });
  await dialog.getByRole("button", { name: "Continue" }).click();

  await expect(
    dialog.getByText("Phone is required when phone or text is selected."),
  ).toBeVisible();

  await dialog.getByLabel("Phone *").fill("+1 555 123 4567");
  await expect(
    dialog.getByText("Phone is required when phone or text is selected."),
  ).not.toBeVisible();
});

test("clears the phone error when phone is no longer required", async ({
  page,
}) => {
  const dialog = await openLeadForm(page);

  await completeContactStep(dialog, { contactMethod: "Text" });
  await dialog.getByRole("button", { name: "Continue" }).click();
  const phoneError = dialog.getByText(
    "Phone is required when phone or text is selected.",
  );

  await expect(phoneError).toBeVisible();
  await dialog.getByRole("button", { name: "Email" }).click();
  await expect(phoneError).not.toBeVisible();
});

test("keeps submit disabled until required consents are selected", async ({
  page,
}) => {
  const dialog = await openLeadForm(page);

  await completeContactStep(dialog);
  await dialog.getByRole("button", { name: "Continue" }).click();
  await dialog.getByRole("button", { name: "Continue" }).click();
  const submitButton = dialog.getByRole("button", {
    name: "Start the request",
  });

  await expect(submitButton).toBeDisabled();

  await dialog.getByLabel(/I agree to be contacted/).check();
  await expect(submitButton).toBeDisabled();

  await dialog.getByLabel(/I agree to the/).check();
  await expect(submitButton).toBeEnabled();
});

test("restores the populated review and allows retry after submission failure", async ({
  page,
}) => {
  await page.route("**/api/leads", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    await route.fulfill({
      status: 500,
      contentType: "application/json",
      body: JSON.stringify({
        ok: false,
        message:
          "We could not process the request right now. Please try again later.",
      }),
    });
  });
  const dialog = await openLeadForm(page);

  await completeContactStep(dialog);
  await dialog.getByRole("button", { name: "Continue" }).click();
  await dialog.getByRole("button", { name: "Continue" }).click();
  await dialog.getByLabel(/I agree to be contacted/).check();
  await dialog.getByLabel(/I agree to the/).check();
  await dialog.getByRole("button", { name: "Start the request" }).click();

  await expect(dialog.getByText("Submitting your request")).toBeVisible();
  await expect(
    dialog.getByRole("img", { name: "Submission complete" }),
  ).not.toBeVisible();
  await expect(
    dialog.getByText(
      "We could not submit the request right now. Please try again later.",
    ),
  ).toBeVisible();
  await expect(
    dialog.getByRole("img", { name: "Submission complete" }),
  ).not.toBeVisible();
  await expect(dialog.getByText("Example Business")).toBeVisible();
  await expect(
    dialog.getByRole("button", { name: "Start the request" }),
  ).toBeEnabled();
});
