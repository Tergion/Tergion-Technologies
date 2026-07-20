import { expect, test } from "@playwright/test";

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
  expect(contactHoverStyles.transform).toBe("matrix(1, 0, 0, 1, 0, -1)");

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
    footer.getByRole("button", { name: "Request an automation review" }),
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
