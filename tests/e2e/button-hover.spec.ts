import { expect, test } from "@playwright/test";

async function readActionStyles(
  locator: import("@playwright/test").Locator,
) {
  return locator.evaluate((element) => {
    const styles = getComputedStyle(element);
    const shadowColors = styles.boxShadow.match(/rgba?\([^)]*\)/g) ?? [];
    const values = styles.backgroundColor.match(/[\d.]+/g)?.map(Number) ?? [];
    const channels = styles.backgroundColor.startsWith("color(srgb")
      ? values.slice(0, 3)
      : values.slice(0, 3).map((value) => value / 255);
    const linearChannels = channels.map((channel) =>
      channel <= 0.04045
        ? channel / 12.92
        : ((channel + 0.055) / 1.055) ** 2.4,
    );

    return {
      backgroundColor: styles.backgroundColor,
      boxShadow: styles.boxShadow,
      hasVisibleShadow:
        styles.boxShadow !== "none" &&
        shadowColors.some((color) => {
          const colorValues = color.match(/[\d.]+/g)?.map(Number) ?? [];

          return color.startsWith("rgba")
            ? (colorValues[3] ?? 0) > 0.001
            : true;
        }),
      transform: styles.transform,
      luminance:
        0.2126 * linearChannels[0] +
        0.7152 * linearChannels[1] +
        0.0722 * linearChannels[2],
    };
  });
}

test("darkens action fills with a neutral classic hover shadow", async ({
  page,
}) => {
  await page.goto("/");

  const actions = [
    page.getByRole("link", { name: "View example" }).first(),
    page.getByRole("button", { name: "Ask about this workflow" }),
  ];

  for (const action of actions) {
    const before = await readActionStyles(action);

    await action.hover();
    await expect
      .poll(async () => (await readActionStyles(action)).backgroundColor)
      .not.toBe(before.backgroundColor);
    await expect
      .poll(async () => (await readActionStyles(action)).transform)
      .toBe("matrix(1, 0, 0, 1, 0, -1)");

    const after = await readActionStyles(action);

    expect(after.luminance).toBeLessThan(before.luminance);
    expect(after.hasVisibleShadow).toBe(true);
    expect(after.boxShadow).toContain("0, 0, 0");
    expect(after.boxShadow).not.toContain("5, 76, 179");

    await page.mouse.move(0, 0);
  }

  const inactiveWorkflowTab = page.getByRole("tab", { name: /Missed Calls/ });
  await inactiveWorkflowTab.hover();
  const tabStyles = await readActionStyles(inactiveWorkflowTab);

  expect(tabStyles.hasVisibleShadow).toBe(false);
  expect(tabStyles.transform).toBe("none");

  const desktopNavAction = page
    .getByRole("navigation", { name: "Primary" })
    .getByRole("button", { name: "Start when ready" });
  await desktopNavAction.hover();
  const desktopNavStyles = await readActionStyles(desktopNavAction);

  expect(desktopNavStyles.hasVisibleShadow).toBe(false);
  expect(desktopNavStyles.transform).toBe("none");

  await page.setViewportSize({ width: 390, height: 844 });
  const mobileNavAction = page
    .getByRole("navigation", { name: "Mobile" })
    .getByRole("button", { name: "Contact Tergion" });
  await mobileNavAction.hover();
  const mobileNavStyles = await readActionStyles(mobileNavAction);

  expect(mobileNavStyles.hasVisibleShadow).toBe(false);
  expect(mobileNavStyles.transform).toBe("none");
});

test("keeps color and shadow feedback without reduced-motion lift", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  const action = page.getByRole("link", { name: "View example" }).first();
  const before = await readActionStyles(action);

  await action.hover();
  await expect
    .poll(async () => (await readActionStyles(action)).backgroundColor)
    .not.toBe(before.backgroundColor);

  const after = await readActionStyles(action);

  expect(after.luminance).toBeLessThan(before.luminance);
  expect(after.boxShadow).not.toBe(before.boxShadow);
  expect(after.transform).toBe("none");
});

test("applies the hover treatment to form choices but not disabled actions", async ({
  page,
}) => {
  await page.goto("/contact");
  await page.getByRole("button", { name: "Start a quick request" }).click();

  const dialog = page.getByRole("dialog", {
    name: "Choose how to start",
  });
  await dialog.getByLabel("First name *").fill("Hover");
  await dialog.getByLabel("Business name *").fill("Hover Business");
  await dialog.getByLabel("Email *").fill("hover@example.com");
  await dialog.getByRole("button", { name: "Continue" }).click();

  const selectedRadio = dialog.getByRole("radio", { name: "Email" });
  const unselectedRadio = dialog.getByRole("radio", {
    name: "No preference",
  });
  const selectedChoice = selectedRadio.locator("..");
  const unselectedChoice = unselectedRadio.locator("..");

  await expect(selectedRadio).toBeChecked();
  await expect(unselectedRadio).not.toBeChecked();

  for (const choice of [selectedChoice, unselectedChoice]) {
    const before = await readActionStyles(choice);

    await choice.hover();
    await expect
      .poll(async () => (await readActionStyles(choice)).backgroundColor)
      .not.toBe(before.backgroundColor);
    await expect
      .poll(async () => (await readActionStyles(choice)).transform)
      .toBe("matrix(1, 0, 0, 1, 0, -1)");

    const after = await readActionStyles(choice);

    expect(after.luminance).toBeLessThan(before.luminance);
    expect(after.hasVisibleShadow).toBe(true);
    expect(after.boxShadow).not.toContain("5, 76, 179");

    await page.mouse.move(0, 0);
  }

  await unselectedRadio.check();
  await expect(unselectedRadio).toBeChecked();
  await expect(selectedRadio).not.toBeChecked();

  await dialog.getByRole("button", { name: "Back" }).click();

  const disabledBackButton = dialog.getByRole("button", { name: "Back" });
  const disabledBefore = await readActionStyles(disabledBackButton);

  await expect(disabledBackButton).toBeDisabled();
  await disabledBackButton.hover({ force: true });
  await expect
    .poll(
      async () =>
        (await readActionStyles(disabledBackButton)).hasVisibleShadow,
    )
    .toBe(false);
  const disabledAfter = await readActionStyles(disabledBackButton);

  expect(disabledAfter.backgroundColor).toBe(disabledBefore.backgroundColor);
  expect(disabledAfter.hasVisibleShadow).toBe(false);
  expect(disabledAfter.transform).toBe("none");
});
