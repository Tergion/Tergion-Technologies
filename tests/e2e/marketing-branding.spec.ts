import { expect, test } from "@playwright/test";

const marketingRoutes = [
  ["/services", "Business systems and automation infrastructure for SMB operations."],
  ["/examples", "Automation examples with realistic operational value."],
  ["/process", "A practical build process with control built in."],
  ["/about", "Tergion Technologies builds practical systems for growing companies."],
  ["/contact", "Start a request without a heavy intake process."],
] as const;

const sharedLogoRoutes = [
  "/",
  "/services",
  "/examples",
  "/process",
  "/about",
  "/contact",
  "/examples/missed-call-recovery",
  "/privacy",
] as const;

const logoViewports = [
  { width: 1440, height: 900 },
  { width: 1024, height: 768 },
  { width: 390, height: 844 },
] as const;

test("renders the branded homepage structure and accessible hero workflow", async ({
  page,
}) => {
  await page.goto("/");

  await expect(
    page.getByRole("link", { name: "Tergion Technologies home" }),
  ).toBeVisible();
  await expect(
    page
      .locator("#main-content")
      .getByRole("button", { name: "Contact Tergion" }),
  ).toHaveCSS("font-size", "16px");
  await expect(
    page.getByRole("link", { name: "See example automations" }),
  ).toHaveCSS("font-size", "16px");

  const heroWorkflow = page.getByRole("img", {
    name: /Example workflow from lead capture through CRM creation/,
  });

  await expect(heroWorkflow).toBeVisible();
  await expect(heroWorkflow).toContainText("Lead captured");
  await expect(heroWorkflow).toContainText("CRM record created");
  await expect(heroWorkflow).toContainText("AI qualification note");
  await expect(heroWorkflow).toContainText("Follow-up assigned");
  await expect(page.getByText("Controlled", { exact: true })).toBeVisible();

  const footer = page.locator("footer");
  const footerBrandLink = footer.getByRole("link", {
    name: "Tergion Technologies",
    exact: true,
  });

  await expect(footerBrandLink).toHaveAttribute("href", "/");
  await expect(
    footerBrandLink.getByRole("img", { name: "Tergion Technologies" }),
  ).toBeVisible();
  await expect(footer.getByRole("link", { name: "Privacy" })).toBeVisible();
  await expect(
    footer.getByRole("button", { name: "Send a quick request" }),
  ).toBeVisible();

  await expect(page.locator('link[rel="icon"]')).toHaveAttribute(
    "href",
    "/logos/tergion_logo_blue.png",
  );
});

test("uses a neutral footer CTA shadow without boxing text links", async ({
  page,
}) => {
  await page.goto("/");

  const footer = page.locator("footer");
  const contactLink = footer.getByRole("link", { name: "Contact Tergion" });
  const contactBackgroundBefore = await contactLink.evaluate(
    (element) => getComputedStyle(element).backgroundColor,
  );

  await contactLink.hover();
  await expect
    .poll(() =>
      contactLink.evaluate((element) => getComputedStyle(element).borderColor),
    )
    .toBe("rgb(203, 213, 225)");

  const contactHoverStyles = await contactLink.evaluate((element) => {
    const styles = getComputedStyle(element);

    return {
      backgroundColor: styles.backgroundColor,
      boxShadow: styles.boxShadow,
      transform: styles.transform,
    };
  });

  expect(contactHoverStyles.backgroundColor).not.toBe(contactBackgroundBefore);
  expect(contactHoverStyles.boxShadow).not.toBe("none");
  expect(contactHoverStyles.boxShadow).not.toContain("5, 76, 179");
  await expect
    .poll(() =>
      contactLink.evaluate((element) => getComputedStyle(element).transform),
    )
    .toBe("matrix(1, 0, 0, 1, 0, -1)");

  await contactLink.focus();
  const contactFocusStyles = await contactLink.evaluate((element) => {
    const styles = getComputedStyle(element);

    return {
      borderColor: styles.borderColor,
      boxShadow: styles.boxShadow,
    };
  });

  expect(contactFocusStyles.borderColor).toBe("rgb(203, 213, 225)");
  expect(contactFocusStyles.boxShadow).not.toContain("5, 76, 179");

  const interactiveTextControls = [
    footer.getByRole("link", { name: "Privacy" }),
    footer.getByRole("button", { name: "Send a quick request" }),
  ];

  for (const control of interactiveTextControls) {
    const backgroundBefore = await control.evaluate(
      (element) => getComputedStyle(element).backgroundColor,
    );

    await control.hover();
    await expect
      .poll(() =>
        control.evaluate((element) =>
          getComputedStyle(element).textDecorationLine,
        ),
      )
      .toContain("underline");

    const hoverStyles = await control.evaluate((element) => {
      const styles = getComputedStyle(element);

      return {
        backgroundColor: styles.backgroundColor,
        textShadow: styles.textShadow,
      };
    });

    expect(hoverStyles.backgroundColor).toBe(backgroundBefore);
    expect(hoverStyles.textShadow).not.toBe("none");
  }
});

test("keeps workflow tabs keyboard-operable", async ({ page }) => {
  await page.goto("/");

  const firstTab = page.getByRole("tab", { name: /Website Leads/ });
  const secondTab = page.getByRole("tab", { name: /Missed Calls/ });

  await firstTab.focus();
  await expect(firstTab).toHaveAttribute("aria-selected", "true");
  await firstTab.press("ArrowRight");
  await expect(secondTab).toBeFocused();
  await expect(secondTab).toHaveAttribute("aria-selected", "true");
});

test("matches the shared marketing-page surface sequence", async ({ page }) => {
  await page.goto("/");

  const homeHeader = page.locator("section.marketing-page-header");
  const homePrimarySection = page.locator("section").filter({
    has: page.getByRole("heading", {
      name: "Practical systems for sales, customer communication, and operations.",
    }),
  });
  const homeSupportingSection = page.locator("section").filter({
    has: page.getByRole("heading", {
      name: "Choose a workflow. See how the system works.",
    }),
  });

  const homeSurfaces = await Promise.all([
    homeHeader.evaluate((element) => getComputedStyle(element).backgroundImage),
    homePrimarySection.evaluate(
      (element) => getComputedStyle(element).backgroundColor,
    ),
    homeSupportingSection.evaluate(
      (element) => getComputedStyle(element).backgroundColor,
    ),
  ]);

  await page.goto("/services");

  const servicesHeader = page.locator("section.marketing-page-header");
  const servicesSupportingSection = page.locator("section").filter({
    has: page.getByRole("heading", {
      name: /Systems Tergion can configure/,
    }),
  });
  const serviceSurfaces = await Promise.all([
    servicesHeader.evaluate(
      (element) => getComputedStyle(element).backgroundImage,
    ),
    servicesSupportingSection.evaluate(
      (element) => getComputedStyle(element).backgroundColor,
    ),
  ]);

  expect(homeSurfaces[0]).toBe(serviceSurfaces[0]);
  expect(homeSurfaces[1]).toBe("rgba(0, 0, 0, 0)");
  expect(homeSurfaces[2]).toBe(serviceSurfaces[1]);
});

test("uses the shared page header only on top-level marketing routes", async ({
  page,
}) => {
  for (const [route, heading] of marketingRoutes) {
    await page.goto(route);
    await expect(page.locator("[data-marketing-page-header]")).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
  }

  for (const route of ["/examples/missed-call-recovery", "/privacy"]) {
    await page.goto(route);
    await expect(page.locator("[data-marketing-page-header]")).toHaveCount(0);
    await expect(page.locator("footer")).toBeVisible();
  }
});

test("preserves the ordered four-stage process", async ({ page }) => {
  await page.goto("/process");

  const stages = page
    .getByRole("list", { name: "Tergion implementation process" })
    .getByRole("listitem");

  await expect(stages).toHaveCount(4);
  await expect(stages.nth(0)).toContainText("Understand your current process");
  await expect(stages.nth(1)).toContainText("Map the automation plan");
  await expect(stages.nth(2)).toContainText("Build and connect the system");
  await expect(stages.nth(3)).toContainText("Launch, monitor, and adjust");
});

test("top-level marketing routes avoid horizontal page overflow on mobile", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });

  for (const [route] of [["/"], ...marketingRoutes]) {
    await page.goto(route);
    const fitsViewport = await page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth + 1,
    );

    expect(fitsViewport, `${route} should not overflow horizontally`).toBe(true);
  }
});

test("keeps shared logo placement accessible, restrained, and responsive", async ({
  page,
}) => {
  const consoleErrors: string[] = [];
  const failedLogoResponses: string[] = [];

  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });
  page.on("response", (response) => {
    if (response.url().includes("/logos/") && response.status() >= 400) {
      failedLogoResponses.push(`${response.status()} ${response.url()}`);
    }
  });

  for (const viewport of logoViewports) {
    await page.setViewportSize(viewport);

    for (const route of sharedLogoRoutes) {
      await page.goto(route);

      await expect(
        page.getByRole("link", { name: "Tergion Technologies home" }),
      ).toBeVisible();

      const footer = page.locator("footer");
      await footer.scrollIntoViewIfNeeded();

      const footerBrandLink = footer.getByRole("link", {
        name: "Tergion Technologies",
        exact: true,
      });
      const footerLogo = footerBrandLink.getByRole("img", {
        name: "Tergion Technologies",
      });
      const brandDescription = footer.getByText(
        "Business systems, CRM implementation, workflow automation, and AI-assisted operations for growing companies.",
        { exact: true },
      );
      const brandDivider = footer.locator("[data-footer-brand-divider]");
      const contactLink = footer.getByRole("link", {
        name: "Contact Tergion",
        exact: true,
      });

      await expect(footerBrandLink).toHaveCount(1);
      await expect(footerBrandLink).toHaveAttribute("href", "/");
      await expect(footerBrandLink).toHaveText("");
      await expect(footerLogo).toBeVisible();
      await expect(footerLogo).toHaveAttribute("alt", "Tergion Technologies");
      await expect(page.locator('nav[aria-label="Mobile"] img')).toHaveCount(0);

      await footerLogo.evaluate((image: HTMLImageElement) => image.decode());
      const decodedLogoSource = decodeURIComponent(
        await footerLogo.evaluate((image: HTMLImageElement) => image.currentSrc),
      );
      expect(decodedLogoSource).toContain(
        "/logos/tergion_logo_white_text.png",
      );

      const logoBox = await footerLogo.boundingBox();
      const descriptionBox = await brandDescription.boundingBox();
      const dividerBox = await brandDivider.boundingBox();
      const contactBox = await contactLink.boundingBox();
      expect(logoBox).not.toBeNull();
      expect(descriptionBox).not.toBeNull();
      expect(dividerBox).not.toBeNull();
      expect(contactBox).not.toBeNull();
      expect(logoBox?.width).toBeGreaterThanOrEqual(188);
      expect(logoBox?.width).toBeLessThanOrEqual(208);

      if (viewport.width >= 640) {
        expect(descriptionBox?.x).toBeGreaterThan(
          (logoBox?.x ?? 0) + (logoBox?.width ?? 0),
        );
        expect(dividerBox?.width).toBeLessThanOrEqual(1.5);
      } else {
        expect(descriptionBox?.y).toBeGreaterThan(
          (logoBox?.y ?? 0) + (logoBox?.height ?? 0),
        );
        expect(dividerBox?.height).toBeLessThanOrEqual(1.5);
      }

      expect(contactBox?.x).toBe(descriptionBox?.x);
      expect(contactBox?.y).toBeGreaterThan(
        (descriptionBox?.y ?? 0) + (descriptionBox?.height ?? 0),
      );

      await footerBrandLink.focus();
      await expect(footerBrandLink).toBeFocused();
      const focusShadow = await footerBrandLink.evaluate(
        (element) => getComputedStyle(element).boxShadow,
      );
      expect(focusShadow).not.toBe("none");

      const fitsViewport = await page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth + 1,
      );
      expect(fitsViewport, `${route} should fit at ${viewport.width}px`).toBe(
        true,
      );

      await expect(page.locator('link[rel="icon"]')).toHaveAttribute(
        "href",
        "/logos/tergion_logo_blue.png",
      );
    }
  }

  expect(failedLogoResponses).toEqual([]);
  expect(consoleErrors).toEqual([]);
});
