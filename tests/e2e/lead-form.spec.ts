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
  const dialog = await openLeadForm(page);

  await completeContactStep(dialog);
  await dialog.getByRole("button", { name: "Continue" }).click();
  await dialog.getByRole("button", { name: "CRM setup" }).click();
  await dialog.getByRole("button", { name: "Continue" }).click();
  await dialog.getByLabel(/I agree to be contacted/).check();
  await dialog.getByLabel(/I agree to the/).check();

  await page.waitForTimeout(3_600);
  await dialog.getByRole("button", { name: "Start the request" }).click();

  await expect(dialog.getByText("Request received")).toBeVisible();
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

test("requires phone when text is the preferred contact method", async ({
  page,
}) => {
  const dialog = await openLeadForm(page);

  await completeContactStep(dialog, { contactMethod: "Text" });
  await dialog.getByRole("button", { name: "Continue" }).click();

  await expect(
    dialog.getByText("Phone is required when phone or text is selected."),
  ).toBeVisible();
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
