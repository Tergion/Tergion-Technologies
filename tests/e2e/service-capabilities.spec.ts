import { expect, test, type Locator } from "@playwright/test";

function capabilityGroup(page: import("@playwright/test").Page, title: string) {
  return page.locator("[data-capability-group]").filter({ hasText: title });
}

async function boundingBox(locator: Locator) {
  return locator.evaluate((element) => {
    const box = element.getBoundingClientRect();

    return {
      x: box.x + window.scrollX,
      y: box.y + window.scrollY,
      width: box.width,
      height: box.height,
    };
  });
}

test("overlays desktop capability details without shifting later rows", async ({
  page,
}) => {
  await page.goto("/services");

  const groups = page.locator("[data-capability-group]");
  const crm = capabilityGroup(page, "CRM & Contacts");
  const pipelines = capabilityGroup(page, "Pipelines & Opportunities");
  const automation = capabilityGroup(page, "Automation & Workflows");

  await expect(groups).toHaveCount(10);

  const automationBefore = await boundingBox(automation);

  await pipelines.locator("summary").click();
  await expect(pipelines).toHaveAttribute("open", "");

  const automationAfter = await boundingBox(automation);
  const dropdownBox = await boundingBox(
    pipelines.locator("[data-capability-items]"),
  );

  expect(Math.abs(automationAfter.y - automationBefore.y)).toBeLessThanOrEqual(
    1,
  );
  expect(dropdownBox.y).toBeLessThan(automationAfter.y + automationAfter.height);
  expect(dropdownBox.y + dropdownBox.height).toBeGreaterThan(automationAfter.y);

  await crm.locator("summary").click();
  await expect(crm).toHaveAttribute("open", "");
  await expect(pipelines).not.toHaveAttribute("open", "");
  await expect(page.locator("[data-capability-group][open]")).toHaveCount(1);

  await crm.locator("summary").click();
  await expect(page.locator("[data-capability-group][open]")).toHaveCount(0);
});

test("opens final-row capability details upward on desktop", async ({ page }) => {
  await page.goto("/services");

  const socialPlanner = capabilityGroup(page, "Social Planner");

  await expect(socialPlanner).toHaveAttribute("data-dropdown-placement", "up");
  await socialPlanner.locator("summary").click();

  const groupBox = await boundingBox(socialPlanner);
  const dropdownBox = await boundingBox(
    socialPlanner.locator("[data-capability-items]"),
  );

  expect(dropdownBox.y + dropdownBox.height).toBeLessThanOrEqual(
    groupBox.y + 2,
  );
});

test("keeps capability expansion in normal flow on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/services");

  const crm = capabilityGroup(page, "CRM & Contacts");
  const pipelines = capabilityGroup(page, "Pipelines & Opportunities");
  const pipelinesBefore = await boundingBox(pipelines);

  await crm.locator("summary").click();

  const pipelinesAfter = await boundingBox(pipelines);
  const dropdownPosition = await crm
    .locator("[data-capability-items]")
    .evaluate((element) => getComputedStyle(element).position);

  expect(dropdownPosition).toBe("static");
  expect(pipelinesAfter.y).toBeGreaterThan(pipelinesBefore.y);
  await expect(page.locator("[data-capability-group][open]")).toHaveCount(1);
});
