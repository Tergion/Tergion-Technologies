import { expect, test, type Locator, type Page } from "@playwright/test";

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

async function expectConnectedDesktopOutline(
  page: Page,
  group: Locator,
  placement: "up" | "down",
) {
  const joinedEdgeTolerance = 2;
  const groupBox = await boundingBox(group);
  const dropdown = group.locator("[data-capability-items]");
  const dropdownBox = await boundingBox(dropdown);
  const groupSurface = await group.evaluate((element) => {
    const style = getComputedStyle(element);
    const ring = getComputedStyle(element, "::before");

    return {
      filter: style.filter,
      ringBorderBottom: ring.borderBottomWidth,
      ringBorderLeft: ring.borderLeftWidth,
      ringBorderRight: ring.borderRightWidth,
      ringBorderRightColor: ring.borderRightColor,
      ringBorderTop: ring.borderTopWidth,
      shadow: style.boxShadow,
    };
  });
  const outline = await dropdown.evaluate((element) => {
    const style = getComputedStyle(element);
    const ring = getComputedStyle(element, "::before");

    return {
      fadeDuration: style.transitionDuration,
      fadeProperty: style.transitionProperty,
      ringBorderBottom: ring.borderBottomWidth,
      ringBorderLeft: ring.borderLeftWidth,
      ringBorderRight: ring.borderRightWidth,
      ringBorderRightColor: ring.borderRightColor,
      ringBorderTop: ring.borderTopWidth,
      ringContent: ring.content,
      shadow: style.boxShadow,
    };
  });

  expect(Math.abs(dropdownBox.x - groupBox.x)).toBeLessThanOrEqual(1);
  expect(
    Math.abs(
      dropdownBox.x + dropdownBox.width - (groupBox.x + groupBox.width),
    ),
  ).toBeLessThanOrEqual(1);
  expect(outline.ringContent).not.toBe("none");
  expect(outline.fadeDuration).toContain("0.14s");
  expect(outline.fadeProperty).toContain("opacity");
  expect(groupSurface.filter).toContain("drop-shadow");
  expect(groupSurface.shadow).toBe("none");
  expect(outline.shadow).toBe("none");
  expect(groupSurface.ringBorderLeft).toBe("1px");
  expect(groupSurface.ringBorderRight).toBe("1px");
  expect(outline.ringBorderLeft).toBe("1px");
  expect(outline.ringBorderRight).toBe("1px");
  expect(outline.ringBorderRightColor).toBe(
    groupSurface.ringBorderRightColor,
  );

  const summary = group.locator("summary");

  await summary.press("Tab");
  await page.keyboard.press("Shift+Tab");
  await expect(summary).toBeFocused();

  const focusedOutline = await group.evaluate((element) => {
    const panel = element.querySelector("[data-capability-items]");
    const summaryElement = element.querySelector("summary");

    if (!(panel instanceof HTMLElement) || !summaryElement) {
      throw new Error("Connected capability controls not found");
    }

    return {
      dropdownRightColor: getComputedStyle(panel, "::before")
        .borderRightColor,
      groupRightColor: getComputedStyle(element, "::before").borderRightColor,
      summaryFocusVisible: summaryElement.matches(":focus-visible"),
    };
  });

  expect(focusedOutline.summaryFocusVisible).toBe(true);
  expect(focusedOutline.groupRightColor).toBe(
    focusedOutline.dropdownRightColor,
  );
  expect(focusedOutline.groupRightColor).not.toBe(
    groupSurface.ringBorderRightColor,
  );

  if (placement === "up") {
    expect(
      Math.abs(dropdownBox.y + dropdownBox.height - groupBox.y),
    ).toBeLessThanOrEqual(joinedEdgeTolerance);
    expect(groupSurface.ringBorderTop).toBe("0px");
    expect(groupSurface.ringBorderBottom).toBe("1px");
    expect(outline.ringBorderTop).toBe("1px");
    expect(outline.ringBorderBottom).toBe("0px");
  } else {
    expect(
      Math.abs(dropdownBox.y - (groupBox.y + groupBox.height)),
    ).toBeLessThanOrEqual(joinedEdgeTolerance);
    expect(groupSurface.ringBorderTop).toBe("1px");
    expect(groupSurface.ringBorderBottom).toBe("0px");
    expect(outline.ringBorderTop).toBe("0px");
    expect(outline.ringBorderBottom).toBe("1px");
  }
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
  await expectConnectedDesktopOutline(page, pipelines, "down");

  const automationAfter = await boundingBox(automation);
  const dropdownBox = await boundingBox(
    pipelines.locator("[data-capability-items]"),
  );

  expect(Math.abs(automationAfter.y - automationBefore.y)).toBeLessThanOrEqual(
    1,
  );
  expect(dropdownBox.y).toBeLessThan(automationAfter.y + automationAfter.height);
  expect(dropdownBox.y + dropdownBox.height).toBeGreaterThan(automationAfter.y);

  const switchStart = await crm.evaluate((currentGroup) => {
    currentGroup.querySelector("summary")?.click();

    const closingGroup = document.querySelector(
      "[data-capability-group][data-state='closing']",
    );

    return {
      closingGroupIsOpen:
        closingGroup instanceof HTMLDetailsElement && closingGroup.open,
      closingGroupText: closingGroup?.textContent,
      currentGroupIsOpen:
        currentGroup instanceof HTMLDetailsElement && currentGroup.open,
      openGroupCount: document.querySelectorAll(
        "[data-capability-group][open]",
      ).length,
    };
  });

  expect(switchStart.closingGroupIsOpen).toBe(true);
  expect(switchStart.closingGroupText).toContain(
    "Pipelines & Opportunities",
  );
  expect(switchStart.currentGroupIsOpen).toBe(false);
  expect(switchStart.openGroupCount).toBe(1);
  await expect(pipelines).not.toHaveAttribute("open", "", {
    timeout: 1_000,
  });
  await expect(crm).toHaveAttribute("open", "");
  await expect(page.locator("[data-capability-group][open]")).toHaveCount(1);

  const closeStart = await crm.evaluate((currentGroup) => {
    currentGroup.querySelector("summary")?.click();

    return {
      isClosing: currentGroup.getAttribute("data-state") === "closing",
      isOpen:
        currentGroup instanceof HTMLDetailsElement && currentGroup.open,
    };
  });

  expect(closeStart).toEqual({ isClosing: true, isOpen: true });
  await expect(page.locator("[data-capability-group][open]")).toHaveCount(0);
});

test("keeps capability details rendered through the closing fade", async ({
  page,
}) => {
  await page.goto("/services");

  const crm = capabilityGroup(page, "CRM & Contacts");
  const details = crm.locator("[data-capability-items]");

  await crm.locator("summary").click();
  await expect(details).toHaveCSS("opacity", "1");
  const closingState = await crm.evaluate((currentGroup) => {
    const capabilityItems = currentGroup.querySelector(
      "[data-capability-items]",
    );

    currentGroup.querySelector("summary")?.click();
    capabilityItems?.getBoundingClientRect();

    return {
      hasOpacityTransition: capabilityItems
        ?.getAnimations()
        .some(
          (animation) =>
            animation instanceof CSSTransition &&
            animation.transitionProperty === "opacity",
        ),
      isClosing: currentGroup.getAttribute("data-state") === "closing",
      isOpen:
        currentGroup instanceof HTMLDetailsElement && currentGroup.open,
    };
  });

  expect(closingState).toEqual({
    hasOpacityTransition: true,
    isClosing: true,
    isOpen: true,
  });
  await expect(crm).not.toHaveAttribute("open", "", { timeout: 1_000 });
  await expect(crm).not.toHaveAttribute("data-state", "closing");
});

test("opens final-row capability details upward on desktop", async ({ page }) => {
  await page.goto("/services");

  const socialPlanner = capabilityGroup(page, "Social Planner");

  await expect(socialPlanner).toHaveAttribute("data-dropdown-placement", "up");
  await socialPlanner.locator("summary").click();
  await expectConnectedDesktopOutline(page, socialPlanner, "up");

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

test("disables capability fades when reduced motion is requested", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/services");

  const crm = capabilityGroup(page, "CRM & Contacts");
  const transitionDuration = await crm
    .locator("[data-capability-items]")
    .evaluate((element) => getComputedStyle(element).transitionDuration);

  expect(Number.parseFloat(transitionDuration)).toBeLessThanOrEqual(0.000001);

  await crm.locator("summary").click();
  await crm.locator("summary").click();
  await expect(crm).not.toHaveAttribute("open", "");
});
