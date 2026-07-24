import { expect, test } from "@playwright/test";

function workflowStep(page: import("@playwright/test").Page, title: string) {
  return page
    .locator("[data-workflow-step-item]")
    .filter({ has: page.getByRole("button", { name: new RegExp(title) }) });
}

function workflowPreview(page: import("@playwright/test").Page) {
  return page.locator("[data-workflow-preview]");
}

function previewSteps(page: import("@playwright/test").Page) {
  return workflowPreview(page).locator("[data-workflow-preview-step]");
}

test("lets pointer and keyboard users navigate the example preview", async ({
  page,
}) => {
  await page.goto("/");

  const steps = previewSteps(page);
  const lowerSteps = page.locator("[data-workflow-step-trigger]");

  await expect(steps).toHaveCount(6);
  await expect(steps.nth(0)).toHaveAccessibleName(
    "Step 1: Website form submitted",
  );
  await expect(steps.filter({ has: page.getByText("Active step") })).toHaveCount(
    1,
  );
  await expect(steps.nth(0)).toHaveAttribute("aria-current", "step");
  await expect(lowerSteps.nth(0)).toHaveAttribute("aria-current", "step");

  await steps.nth(3).click();

  await expect(steps.nth(3)).toHaveAttribute("aria-current", "step");
  await expect(
    workflowPreview(page).locator(
      '[data-workflow-preview-step][aria-current="step"]',
    ),
  ).toHaveCount(1);
  await expect(lowerSteps.nth(3)).toHaveAttribute("aria-current", "step");
  await expect(
    page.locator('[data-workflow-step-trigger][aria-current="step"]'),
  ).toHaveCount(1);
  await expect(
    workflowPreview(page).locator("[data-workflow-preview-details]"),
  ).toContainText("Follow-up email or SMS queued");
  await expect(page.locator("[data-workflow-step-details]")).toHaveCount(0);

  await steps.nth(5).focus();
  await page.keyboard.press("Enter");

  await expect(steps.nth(5)).toHaveAttribute("aria-current", "step");
  await expect(lowerSteps.nth(5)).toHaveAttribute("aria-current", "step");
  await expect(
    workflowPreview(page).locator("[data-workflow-preview-details]"),
  ).toContainText("Strategy call booked");

  for (let index = 0; index < 6; index += 1) {
    await expect(steps.nth(index)).toBeEnabled();
    await expect(steps.nth(index)).toHaveJSProperty("tabIndex", 0);
  }
});

test("keeps preview and control-point selection synchronized", async ({
  page,
}) => {
  await page.goto("/");

  const crmStep = workflowStep(page, "CRM contact created").locator(
    "[data-workflow-step-trigger]",
  );

  await crmStep.click();
  await expect(crmStep).toHaveAttribute("aria-current", "step");
  await expect(previewSteps(page).nth(1)).toHaveAttribute(
    "aria-current",
    "step",
  );

  await page.getByRole("tab", { name: /Missed Calls/ }).click();

  await expect(previewSteps(page)).toHaveCount(6);
  await expect(previewSteps(page).nth(0)).toHaveAttribute(
    "aria-current",
    "step",
  );
  await expect(
    page.locator('[data-workflow-step-trigger][aria-current="step"]'),
  ).toHaveCount(1);
  await expect(
    workflowPreview(page).locator("[data-workflow-preview-details]"),
  ).toContainText("Missed call detected");
});

test("fades connected workflow details with restrained matching borders", async ({
  page,
}) => {
  await page.goto("/");

  const firstStep = workflowStep(page, "Website form submitted");
  const trigger = firstStep.locator("[data-workflow-step-trigger]");
  const details = firstStep.locator("[data-workflow-step-details]");

  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(details).toHaveCount(0);

  await trigger.click();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(details).toHaveAttribute("aria-hidden", "false");
  await expect
    .poll(() =>
      details.evaluate((element) => getComputedStyle(element).opacity),
    )
    .toBe("1");
  await expect
    .poll(() =>
      trigger.evaluate((element) => getComputedStyle(element).borderBottomColor),
    )
    .toBe("rgba(0, 0, 0, 0)");

  const openStyles = await firstStep.evaluate((item) => {
    const button = item.querySelector("[data-workflow-step-trigger]");
    const panel = item.querySelector("[data-workflow-step-details]");

    if (!(button instanceof HTMLElement) || !(panel instanceof HTMLElement)) {
      throw new Error("Workflow step controls not found");
    }

    const buttonStyle = getComputedStyle(button);
    const panelStyle = getComputedStyle(panel);

    return {
      buttonBorderBottomColor: buttonStyle.borderBottomColor,
      buttonBorderRight: buttonStyle.borderRight,
      panelBorderRight: panelStyle.borderRight,
      panelBorderTop: panelStyle.borderTopWidth,
      transitionDuration: panelStyle.transitionDuration,
      transitionProperty: panelStyle.transitionProperty,
    };
  });

  expect(openStyles.buttonBorderBottomColor).toBe("rgba(0, 0, 0, 0)");
  expect(openStyles.buttonBorderRight).toBe(openStyles.panelBorderRight);
  expect(openStyles.panelBorderTop).toBe("0px");
  expect(openStyles.transitionDuration).toContain("0.14s");
  expect(openStyles.transitionProperty).toContain("opacity");

  await trigger.click();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(details).toHaveAttribute("aria-hidden", "true");
  await expect(details).toHaveCount(0);

  const fourthStep = workflowStep(page, "Follow-up email or SMS queued");
  const fourthTrigger = fourthStep.locator("[data-workflow-step-trigger]");

  await fourthTrigger.hover();
  await expect(fourthTrigger).toHaveAttribute("aria-expanded", "true");
  await expect
    .poll(() =>
      fourthTrigger.evaluate(
        (element) => getComputedStyle(element).borderTopColor,
      ),
    )
    .toBe("rgba(0, 0, 0, 0)");
  const upwardStyles = await fourthStep.evaluate((item) => {
    const button = item.querySelector("[data-workflow-step-trigger]");
    const panel = item.querySelector("[data-workflow-step-details]");

    if (!(button instanceof HTMLElement) || !(panel instanceof HTMLElement)) {
      throw new Error("Workflow step controls not found");
    }

    const buttonStyle = getComputedStyle(button);
    const panelStyle = getComputedStyle(panel);

    return {
      buttonBorderRight: buttonStyle.borderRight,
      buttonBorderTopColor: buttonStyle.borderTopColor,
      panelBorderBottom: panelStyle.borderBottomWidth,
      panelBorderRight: panelStyle.borderRight,
    };
  });

  expect(upwardStyles.buttonBorderTopColor).toBe("rgba(0, 0, 0, 0)");
  expect(upwardStyles.buttonBorderRight).toBe(upwardStyles.panelBorderRight);
  expect(upwardStyles.panelBorderBottom).toBe("0px");
});

test("removes workflow detail fades with reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  const details = workflowStep(page, "Website form submitted").locator(
    "[data-workflow-step-details]",
  );

  await workflowStep(page, "Website form submitted")
    .locator("[data-workflow-step-trigger]")
    .click();

  const transitionDuration = await details.evaluate((element) =>
    Number.parseFloat(getComputedStyle(element).transitionDuration),
  );

  expect(transitionDuration).toBeLessThanOrEqual(0.000001);
});
