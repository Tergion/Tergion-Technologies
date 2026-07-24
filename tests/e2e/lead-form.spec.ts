import { expect, test, type Locator } from "@playwright/test";

async function openLeadForm(page: import("@playwright/test").Page) {
  await page.goto("/contact");
  await page.getByRole("button", { name: "Start a quick request" }).click();

  return page.getByRole("dialog", {
    name: "Choose how to start",
  });
}

async function completeContactBasics(
  dialog: import("@playwright/test").Locator,
) {
  const panel = dialog.getByRole("tabpanel", { name: "Quick Request" });

  await panel.getByLabel("First name *").fill("Playwright");
  await panel.getByLabel("Business name *").fill("Example Business");
  await panel.getByLabel("Email *").fill("playwright@example.com");
}

async function completeContactPreferences(
  dialog: import("@playwright/test").Locator,
  overrides: {
    contactMethod?: "Email" | "Phone" | "No preference";
    phone?: string;
  } = {},
) {
  const panel = dialog.getByRole("tabpanel", { name: "Quick Request" });

  if (overrides.phone) {
    await panel.getByLabel("Phone (optional)").fill(overrides.phone);
  }

  await panel
    .getByLabel("Scheduling preference *")
    .fill("Weekdays after 5 PM");

  if (overrides.contactMethod) {
    await panel.getByRole("radio", { name: overrides.contactMethod }).check();
  }
}

async function expectQuickRequestProgress(
  panel: import("@playwright/test").Locator,
  step: number,
  percentage: number,
) {
  await expect(
    panel.getByText(`Step ${step} of 4`, { exact: true }),
  ).toBeVisible();
  await expect(panel.getByText(`${percentage}%`, { exact: true })).toBeVisible();
  await expect(
    panel.getByRole("progressbar", {
      name: `Quick request progress: step ${step} of 4`,
    }),
  ).toHaveAttribute("aria-valuenow", String(step));
}

async function expectErrorAboveAndRightAligned(
  control: Locator,
  error: Locator,
) {
  const controlBox = await control.boundingBox();
  const errorBox = await error.boundingBox();

  if (!controlBox || !errorBox) {
    throw new Error("Expected the validation control and error to be visible");
  }

  expect(errorBox.y + errorBox.height).toBeLessThanOrEqual(controlBox.y);
  expect(
    Math.abs(
      errorBox.x + errorBox.width - (controlBox.x + controlBox.width),
    ),
  ).toBeLessThanOrEqual(2);
  await expect(error).toHaveCSS("color", "rgb(163, 58, 46)");
}

async function advanceQuickRequestToReview(
  dialog: import("@playwright/test").Locator,
) {
  const panel = dialog.getByRole("tabpanel", { name: "Quick Request" });

  await completeContactBasics(dialog);
  await panel.getByRole("button", { name: "Continue" }).click();
  await completeContactPreferences(dialog);
  await panel.getByRole("button", { name: "Continue" }).click();
  await panel.getByRole("button", { name: "Continue" }).click();
}

async function openAssessment(page: import("@playwright/test").Page) {
  await page.goto("/contact");
  await page.getByRole("button", { name: "Take the free assessment" }).click();
  const dialog = page.getByRole("dialog", { name: "Choose how to start" });

  await expect(
    dialog.getByRole("tab", { name: "Automation Assessment" }),
  ).toHaveAttribute("aria-selected", "true");
  await dialog
    .getByRole("tabpanel", { name: "Automation Assessment" })
    .getByRole("button", { name: "Start assessment" })
    .click();

  return dialog;
}

async function advanceAssessmentToStepSeven(
  dialog: import("@playwright/test").Locator,
) {
  const panel = dialog.getByRole("tabpanel", {
    name: "Automation Assessment",
  });

  await panel.getByLabel("First name *", { exact: true }).fill("Assessment");
  await panel.getByLabel("Business name *", { exact: true }).fill("Assessment Business");
  await panel.getByLabel("Email *", { exact: true }).fill("assessment@example.com");
  await panel.getByRole("button", { name: "Continue" }).click();

  await panel.getByLabel("Phone *", { exact: true }).fill("+1 555 123 4567");
  await panel.getByRole("radio", { name: "Email" }).check();
  await panel.getByRole("button", { name: "Continue" }).click();

  await panel.getByLabel("Industry *", { exact: true }).fill("Professional services");
  await panel.getByRole("radio", { name: "Under 20" }).check();
  await panel.getByRole("button", { name: "Continue" }).click();

  await panel.getByRole("radio", { name: "Owner" }).check();
  await panel.getByRole("radio", { name: "We call them back later" }).check();
  await panel.getByRole("button", { name: "Continue" }).click();

  await panel.getByRole("radio", { name: "Within 1 hour" }).check();
  await panel.getByRole("button", { name: "Continue" }).click();

  await panel.getByRole("radio", { name: "Faster follow-up" }).check();
  await panel.getByRole("button", { name: "Continue" }).click();
}

async function advanceAssessmentToReview(
  dialog: import("@playwright/test").Locator,
) {
  await advanceAssessmentToStepSeven(dialog);
  await dialog
    .getByRole("tabpanel", { name: "Automation Assessment" })
    .getByRole("radio", {
      name: "Review my responses and contact me with recommendations",
    })
    .check();
  await dialog
    .getByRole("tabpanel", { name: "Automation Assessment" })
    .getByRole("button", { name: "Continue" })
    .click();
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

  await completeContactBasics(dialog);
  await dialog.getByRole("button", { name: "Continue" }).click();
  await completeContactPreferences(dialog);
  await dialog.getByRole("button", { name: "Continue" }).click();
  await dialog.getByRole("button", { name: "CRM setup" }).click();
  await dialog.getByRole("button", { name: "Continue" }).click();
  await dialog.getByLabel(/I agree to be contacted/).check();
  await dialog.getByLabel(/I agree to the/).check();

  await dialog.getByRole("button", { name: "Send a quick request" }).click();

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
  const panel = dialog.getByRole("tabpanel", { name: "Quick Request" });
  const businessName = panel.getByLabel("Business name *");
  const businessOffsetBefore = await businessName.evaluate(
    (element) => (element as HTMLElement).offsetTop,
  );

  await panel.getByRole("button", { name: "Continue" }).click();

  const firstName = panel.getByLabel("First name *");
  const firstNameError = panel.getByText("First name is required.");
  const businessNameError = panel.getByText("Business name is required.");
  const email = panel.getByLabel("Email *");
  const emailError = panel.getByText("Email is required.");
  const alert = panel.getByRole("alert");

  await expect(firstNameError).toBeVisible();
  await expect(businessNameError).toBeVisible();
  await expect(emailError).toBeVisible();
  await expect(alert).toHaveText(
    "Please review the highlighted field before continuing.",
  );
  await expect(panel.getByRole("alert")).toHaveCount(1);
  await expect(firstName).toBeFocused();
  await expect(firstName).toHaveAttribute("aria-invalid", "true");
  await expectErrorAboveAndRightAligned(firstName, firstNameError);
  await expectErrorAboveAndRightAligned(businessName, businessNameError);
  await expectErrorAboveAndRightAligned(email, emailError);
  expect(
    await businessName.evaluate((element) => (element as HTMLElement).offsetTop),
  ).toBe(businessOffsetBefore);
  await expect(panel.locator("[data-form-error-overlay]")).toHaveCSS(
    "position",
    "absolute",
  );
  await expect(
    panel.getByText("Scheduling preference is required."),
  ).not.toBeVisible();

  await panel.getByRole("button", { name: "Dismiss error message" }).click();
  await expect(alert).not.toBeVisible();
  await expect(businessNameError).toBeVisible();

  await completeContactBasics(dialog);
  await panel.getByRole("button", { name: "Continue" }).click();
  await panel.getByRole("button", { name: "Continue" }).click();
  const scheduling = panel.getByLabel("Scheduling preference *");
  const schedulingError = panel.getByText(
    "Scheduling preference is required.",
  );

  await expect(schedulingError).toBeVisible();
  await expectErrorAboveAndRightAligned(scheduling, schedulingError);
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

test("fades between repeated form alerts without rendering a queue", async ({
  page,
}) => {
  const dialog = await openLeadForm(page);
  const panel = dialog.getByRole("tabpanel", { name: "Quick Request" });
  const continueButton = panel.getByRole("button", { name: "Continue" });

  await continueButton.click();
  const alert = panel.getByRole("alert");
  const firstAlert = await alert.elementHandle();
  const firstNotificationId = await alert.getAttribute("data-notification-id");

  await expect(alert).toBeVisible();
  await continueButton.click();

  await expect(panel.getByRole("alert")).toHaveCount(1);
  expect(await firstAlert?.evaluate((element) => element.isConnected)).toBe(true);
  await expect
    .poll(() => alert.getAttribute("data-notification-id"))
    .not.toBe(firstNotificationId);
  await expect
    .poll(() => firstAlert?.evaluate((element) => element.isConnected))
    .toBe(false);
  await expect(alert).toBeVisible();
});

test("dismisses a form alert after ten active seconds", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.clock.install();
  const dialog = await openLeadForm(page);
  const panel = dialog.getByRole("tabpanel", { name: "Quick Request" });

  await panel.getByRole("button", { name: "Continue" }).click();
  const alert = panel.getByRole("alert");

  await page.clock.runFor(9_000);
  await expect(alert).toBeVisible();
  await page.clock.runFor(1_200);
  await expect(alert).not.toBeVisible();
});

test("pauses form-alert dismissal while hovered or keyboard-focused", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.clock.install();
  const dialog = await openLeadForm(page);
  const panel = dialog.getByRole("tabpanel", { name: "Quick Request" });

  await panel.getByRole("button", { name: "Continue" }).click();
  await page.clock.runFor(250);
  const alert = panel.getByRole("alert");
  const dismissButton = panel.getByRole("button", {
    name: "Dismiss error message",
  });

  await dismissButton.focus();
  await page.clock.runFor(12_000);
  await expect(alert).toBeVisible();

  await panel.getByRole("button", { name: "Continue" }).focus();
  await alert.hover();
  await page.clock.runFor(12_000);
  await expect(alert).toBeVisible();

  await dismissButton.click();
  await expect(alert).not.toBeVisible();
});

test("discards an invalid optional phone when Email is selected", async ({
  page,
}) => {
  const dialog = await openLeadForm(page);
  const panel = dialog.getByRole("tabpanel", { name: "Quick Request" });

  await completeContactBasics(dialog);
  await panel.getByRole("button", { name: "Continue" }).click();
  const phone = panel.getByLabel("Phone (optional)");
  const phoneChoice = panel.getByRole("radio", { name: "Phone" });

  await expect(phoneChoice).toBeDisabled();
  await expect(panel.getByRole("radio", { name: "Text" })).toHaveCount(0);
  await phone.fill("123");
  await expect(phoneChoice).toBeDisabled();
  await panel
    .getByLabel("Scheduling preference *")
    .fill("Weekday afternoons");
  await panel.getByRole("button", { name: "Continue" }).click();
  await expect(
    panel.getByRole("heading", { name: "Business Context" }),
  ).toBeVisible();

  await panel.getByRole("button", { name: "Back" }).click();
  await expect(panel.getByLabel("Phone (optional)")).toHaveValue("");
  await expect(panel.getByRole("radio", { name: "Email" })).toBeChecked();
  await expect(panel.getByText("Enter a valid phone number.")).toHaveCount(0);
});

test("returns the contact preference to Email when Phone becomes invalid", async ({
  page,
}) => {
  const dialog = await openLeadForm(page);
  const panel = dialog.getByRole("tabpanel", { name: "Quick Request" });

  await completeContactBasics(dialog);
  await panel.getByRole("button", { name: "Continue" }).click();
  const phone = panel.getByLabel("Phone (optional)");
  const phoneChoice = panel.getByRole("radio", { name: "Phone" });
  const emailChoice = panel.getByRole("radio", { name: "Email" });

  await phone.fill("+1 555 123 4567");
  await expect(phoneChoice).toBeEnabled();
  await phoneChoice.check();
  await expect(phoneChoice).toBeChecked();

  await phone.clear();
  await expect(phoneChoice).toBeDisabled();
  await expect(emailChoice).toBeChecked();
});

test("keeps submit disabled until required consents are selected", async ({
  page,
}) => {
  const dialog = await openLeadForm(page);

  await advanceQuickRequestToReview(dialog);
  const submitButton = dialog.getByRole("button", {
    name: "Send a quick request",
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

  await advanceQuickRequestToReview(dialog);
  await dialog.getByLabel(/I agree to be contacted/).check();
  await dialog.getByLabel(/I agree to the/).check();
  await dialog.getByRole("button", { name: "Send a quick request" }).click();

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
    dialog.getByRole("button", { name: "Send a quick request" }),
  ).toBeEnabled();
});

test("existing triggers open Quick Request and assessment triggers open the correct tab", async ({
  page,
}) => {
  await page.goto("/contact");
  await page.getByRole("button", { name: "Start a quick request" }).click();
  let dialog = page.getByRole("dialog", { name: "Choose how to start" });

  await expect(dialog.getByRole("tab", { name: "Quick Request" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await dialog.getByRole("button", { name: "Close" }).click();
  await page.getByRole("button", { name: "Take the free assessment" }).click();
  dialog = page.getByRole("dialog", { name: "Choose how to start" });
  await expect(
    dialog.getByRole("tab", { name: "Automation Assessment" }),
  ).toHaveAttribute("aria-selected", "true");
});

test("quick request mirrors the assessment presentation across four steps", async ({
  page,
}) => {
  const dialog = await openLeadForm(page);
  const panel = dialog.getByRole("tabpanel", { name: "Quick Request" });

  await expectQuickRequestProgress(panel, 1, 25);
  await expect(
    panel.getByRole("heading", { name: "Contact" }),
  ).toBeVisible();
  await expect(panel.getByRole("group", { name: "Full name" })).toBeVisible();
  await expect(panel.getByLabel("Last name (optional)")).toBeVisible();
  await expect(panel.getByLabel("Scheduling preference *")).toHaveCount(0);

  await completeContactBasics(dialog);
  await panel.getByLabel("Last name (optional)").fill("Tester");
  await panel.getByRole("button", { name: "Continue" }).click();

  await expectQuickRequestProgress(panel, 2, 50);
  await expect(
    panel.getByRole("heading", { name: "Contact Preferences" }),
  ).toBeVisible();
  await expect(panel.getByLabel("Phone (optional)")).toBeVisible();
  await expect(panel.getByLabel("Scheduling preference *")).toBeVisible();
  await expect(panel.getByRole("radio", { name: "Email" })).toBeChecked();
  await expect(panel.getByRole("radio", { name: "Phone" })).toBeDisabled();
  await expect(panel.getByRole("radio", { name: "Text" })).toHaveCount(0);

  await completeContactPreferences(dialog);
  await panel.getByRole("button", { name: "Continue" }).click();
  await expectQuickRequestProgress(panel, 3, 75);
  await expect(
    panel.getByRole("heading", { name: "Business Context" }),
  ).toBeVisible();

  await panel.getByRole("button", { name: "Continue" }).click();
  await expectQuickRequestProgress(panel, 4, 100);
  await expect(
    panel.getByRole("heading", { name: "Review and Consent" }),
  ).toBeVisible();
  await expect(
    panel.getByRole("heading", { name: "Request summary" }),
  ).toBeVisible();
  await expect(panel.getByText("Playwright Tester")).toBeVisible();

  await panel.getByRole("button", { name: "Back" }).click();
  await expectQuickRequestProgress(panel, 3, 75);
  await expect(
    panel.getByRole("heading", { name: "Business Context" }),
  ).toBeVisible();
});

test("assessment uses accessible keyboard tabs and eight-step progress", async ({
  page,
}) => {
  const dialog = await openAssessment(page);

  await expect(dialog.getByText("Step 1 of 8", { exact: true })).toBeVisible();
  await expect(
    dialog.getByRole("progressbar", {
      name: "Assessment progress: step 1 of 8",
    }),
  ).toHaveAttribute("aria-valuenow", "1");

  const assessmentTab = dialog.getByRole("tab", {
    name: "Automation Assessment",
  });
  await assessmentTab.focus();
  await assessmentTab.press("ArrowLeft");
  await expect(dialog.getByRole("tab", { name: "Quick Request" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await dialog.getByRole("tab", { name: "Quick Request" }).press("End");
  await expect(assessmentTab).toHaveAttribute("aria-selected", "true");

  await advanceAssessmentToReview(dialog);
  await expect(dialog.getByText("Step 8 of 8", { exact: true })).toBeVisible();
  await expect(
    dialog.getByRole("progressbar", {
      name: "Assessment progress: step 8 of 8",
    }),
  ).toHaveAttribute("aria-valuenow", "8");
});

test("assessment requires follow-up preference, keeps scheduling optional, and has no Text contact option", async ({
  page,
}) => {
  const dialog = await openAssessment(page);
  const panel = dialog.getByRole("tabpanel", {
    name: "Automation Assessment",
  });

  await panel.getByLabel("First name *", { exact: true }).fill("Assessment");
  await panel.getByLabel("Business name *", { exact: true }).fill("Business");
  await panel.getByLabel("Email *", { exact: true }).fill("person@example.com");
  await panel.getByRole("button", { name: "Continue" }).click();
  await expect(panel.getByRole("radio", { name: "Text" })).toHaveCount(0);
  await panel.getByLabel("Phone *", { exact: true }).fill("+1 555 123 4567");
  await panel.getByRole("button", { name: "Continue" }).click();
  const contactMethodGroup = panel.getByRole("group", {
    name: /Best way to reach you/,
  });
  const contactMethodError = contactMethodGroup.locator(
    "[data-form-field-error]",
  );

  await expect(contactMethodError).toBeVisible();
  await expectErrorAboveAndRightAligned(
    contactMethodGroup.getByRole("radio").last().locator(".."),
    contactMethodError,
  );
  await expect(panel.getByRole("alert")).toHaveText(
    "Please review the highlighted field before continuing.",
  );
  await panel.getByRole("radio", { name: "Email" }).check();
  await panel.getByRole("button", { name: "Continue" }).click();
  await expect(panel.getByRole("heading", { name: "Business Profile" })).toBeVisible();

  await panel.getByLabel("Industry *", { exact: true }).fill("Services");
  await panel.getByRole("radio", { name: "Under 20" }).check();
  await panel.getByRole("button", { name: "Continue" }).click();
  await panel.getByRole("radio", { name: "Owner" }).check();
  await panel.getByRole("radio", { name: "We call them back later" }).check();
  await panel.getByRole("button", { name: "Continue" }).click();
  await panel.getByRole("radio", { name: "Within 1 hour" }).check();
  await panel.getByRole("button", { name: "Continue" }).click();
  await panel.getByRole("radio", { name: "Faster follow-up" }).check();
  await panel.getByRole("button", { name: "Continue" }).click();
  const additionalNotes = panel.getByLabel("Additional notes (optional)");

  await additionalNotes.evaluate((element) => {
    const textarea = element as HTMLTextAreaElement;
    const valueSetter = Object.getOwnPropertyDescriptor(
      HTMLTextAreaElement.prototype,
      "value",
    )?.set;

    valueSetter?.call(textarea, "x".repeat(1201));
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await panel.getByRole("button", { name: "Continue" }).click();

  const followUpGroup = panel.getByRole("group", {
    name: /How would you like us to follow up/,
  });
  const followUpError = followUpGroup.getByText(
    "Select how you would like us to follow up.",
  );
  const additionalNotesError = additionalNotes
    .locator("..")
    .locator("[data-form-field-error]");

  await expect(followUpError).toBeVisible();
  await expect(additionalNotesError).toBeVisible();
  await expectErrorAboveAndRightAligned(
    followUpGroup.getByRole("radio").first().locator(".."),
    followUpError,
  );
  await expectErrorAboveAndRightAligned(
    additionalNotes,
    additionalNotesError,
  );
  await expect(panel.getByRole("alert")).toHaveCount(1);
});

test("both form states survive tab changes without copying PII", async ({ page }) => {
  const dialog = await openLeadForm(page);
  const quickPanel = dialog.getByRole("tabpanel", { name: "Quick Request" });
  const quickFirstName = quickPanel
    .getByLabel("First name *", { exact: true });

  await quickPanel.getByRole("button", { name: "Continue" }).click();
  await expect(quickPanel.getByRole("alert")).toBeVisible();
  await quickFirstName.fill("Quick Person");
  await dialog.getByRole("tab", { name: "Automation Assessment" }).click();
  const assessmentPanel = dialog.getByRole("tabpanel", {
    name: "Automation Assessment",
  });
  await assessmentPanel.getByRole("button", { name: "Start assessment" }).click();
  const assessmentFirstName = assessmentPanel.getByLabel("First name *", {
    exact: true,
  });
  await expect(assessmentFirstName).toHaveValue("");
  await assessmentFirstName.fill("Assessment Person");

  await dialog.getByRole("tab", { name: "Quick Request" }).click();
  await expect(quickFirstName).toHaveValue("Quick Person");
  await expect(quickPanel.getByRole("alert")).toHaveCount(0);
  await expect(quickPanel.getByText("Business name is required.")).toBeVisible();
  await dialog.getByRole("tab", { name: "Automation Assessment" }).click();
  await expect(assessmentFirstName).toHaveValue("Assessment Person");

  const duplicateIds = await dialog.evaluate((element) => {
    const ids = Array.from(element.querySelectorAll<HTMLElement>("[id]"))
      .map((node) => node.id)
      .filter(Boolean);
    return ids.filter((id, index) => ids.indexOf(id) !== index);
  });
  const browserStorage = await page.evaluate(() => ({
    local: JSON.stringify(localStorage),
    session: JSON.stringify(sessionStorage),
    url: window.location.href,
  }));

  expect(duplicateIds).toEqual([]);
  expect(JSON.stringify(browserStorage)).not.toContain("Quick Person");
  expect(JSON.stringify(browserStorage)).not.toContain("Assessment Person");
});

test("keeps the reduced-motion alert inside the mobile form viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  const dialog = await openLeadForm(page);
  const panel = dialog.getByRole("tabpanel", { name: "Quick Request" });

  await panel.getByRole("button", { name: "Continue" }).click();
  const form = panel.locator("form");
  const alert = panel.getByRole("alert");
  const formBox = await form.boundingBox();
  const alertBox = await alert.boundingBox();
  const dismissBox = await panel
    .getByRole("button", { name: "Dismiss error message" })
    .boundingBox();

  if (!formBox || !alertBox || !dismissBox) {
    throw new Error("Expected the mobile form alert to be visible");
  }

  expect(alertBox.x).toBeGreaterThanOrEqual(formBox.x + 15);
  expect(alertBox.x + alertBox.width).toBeLessThanOrEqual(
    formBox.x + formBox.width - 15,
  );
  expect(alertBox.y).toBeCloseTo(formBox.y + 16, 0);
  expect(dismissBox.width).toBeGreaterThanOrEqual(44);
  expect(dismissBox.height).toBeGreaterThanOrEqual(44);
  await expect(panel.locator("[data-form-error-overlay]")).toHaveCSS(
    "position",
    "absolute",
  );
  expect(
    await alert.evaluate((element) => getComputedStyle(element).transform),
  ).toMatch(/none|matrix\(1, 0, 0, 1, 0, 0\)/);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
    ),
  ).toBe(true);
});

test("closing the modal restores trigger focus, scrolling, and removes dialog state", async ({
  page,
}) => {
  await page.goto("/contact");
  const trigger = page.getByRole("button", { name: "Start a quick request" });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Choose how to start" });

  for (let index = 0; index < 12; index += 1) {
    await page.keyboard.press("Tab");
    await expect
      .poll(() =>
        dialog.evaluate((element) => element.contains(document.activeElement)),
      )
      .toBe(true);
  }

  await page.keyboard.press("Escape");

  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await expect
    .poll(() => page.evaluate(() => document.body.style.overflow))
    .not.toBe("hidden");
  await expect(page.locator('[data-slot="dialog-overlay"]')).toHaveCount(0);
  await expect(page.locator("[inert]")).toHaveCount(0);
});

test("only the active form mounts Turnstile on review", async ({ page }) => {
  const dialog = await openLeadForm(page);

  await advanceQuickRequestToReview(dialog);
  await expect(
    dialog.getByText("Spam protection is disabled for local testing."),
  ).toHaveCount(1);

  await dialog.getByRole("tab", { name: "Automation Assessment" }).click();
  await dialog
    .getByRole("tabpanel", { name: "Automation Assessment" })
    .getByRole("button", { name: "Start assessment" })
    .click();
  await advanceAssessmentToReview(dialog);
  await expect(
    dialog.getByText("Spam protection is disabled for local testing."),
  ).toHaveCount(1);

  await dialog.getByRole("tab", { name: "Quick Request" }).click();
  await expect(
    dialog.getByText("Spam protection is disabled for local testing."),
  ).toHaveCount(1);
});

test("submits an explicit confirmation-only assessment", async ({ page }) => {
  let capturedPayload: Record<string, unknown> | undefined;
  await page.route("**/api/leads", async (route) => {
    capturedPayload = route.request().postDataJSON() as Record<string, unknown>;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        message:
          "Thanks — we received your business automation assessment and recorded that you do not want additional follow-up beyond the confirmation email. No obligation. No pressure.",
        leadId: "assessment-playwright",
      }),
    });
  });
  const dialog = await openAssessment(page);
  const panel = dialog.getByRole("tabpanel", {
    name: "Automation Assessment",
  });

  await advanceAssessmentToStepSeven(dialog);
  await panel
    .getByRole("radio", {
      name: "No follow-up beyond the confirmation email",
    })
    .check();
  await panel.getByRole("button", { name: "Continue" }).click();
  await panel
    .getByLabel(/may use the information I submitted/)
    .check();
  await panel.getByLabel(/I agree to the/).check();
  await panel.getByRole("button", { name: "Submit assessment" }).click();

  await expect(panel.getByText("Assessment received")).toBeVisible();
  await expect(panel.getByText(/recorded that you do not want/)).toBeVisible();
  expect(capturedPayload).toMatchObject({
    submissionType: "automation_assessment",
    formVersion: "automation_assessment_v1",
    assessmentFollowUpPreference: "confirmation-only",
    triggerSource: "contact-automation-assessment",
    schedulingPreference: "",
  });
});

test("first modal open is responsive with the eager bundle", async ({ page }) => {
  await page.goto("/contact");
  const startedAt = await page.evaluate(() => performance.now());
  await page.getByRole("button", { name: "Start a quick request" }).click();
  await expect(
    page.getByRole("dialog", { name: "Choose how to start" }),
  ).toBeVisible();
  const elapsedMs = await page.evaluate(
    (started) => performance.now() - started,
    startedAt,
  );

  console.log(`First modal open: ${elapsedMs.toFixed(1)} ms`);
  expect(elapsedMs).toBeLessThan(2_000);
});
