import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("home loads without runtime errors and provides future store anchors", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page).toHaveTitle("ProtoLab — Da ideia à forma.");
  await expect(page.locator("h1")).toHaveText(
    "Boas ideiasmerecemganhar forma.",
  );
  await expect(page.locator("#sculpture")).toHaveClass(/has-webgl/);
  await expect(page.locator(".service-card")).toHaveCount(3);
  for (const link of await page.locator(".future-link").all()) {
    expect(await link.getAttribute("href")).toBeNull();
    await expect(link).toHaveAttribute("aria-disabled", "true");
  }
  await page.getByRole("link", { name: "Explore as possibilidades" }).click();
  await expect(page).toHaveURL(/#possibilidades$/);
  expect(errors).toEqual([]);
});

test("theme follows system, persists explicit choice, and can return to system", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.getByRole("button", { name: "Escolher tema" }).click();
  await page.getByRole("button", { name: "Claro" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.getByRole("button", { name: "Escolher tema" }).click();
  await page.getByRole("button", { name: "Sistema" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.emulateMedia({ colorScheme: "light" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.getByRole("button", { name: "Escolher tema" }).click();
  await page.keyboard.press("Escape");
  await expect(page.locator("#theme-options")).toBeHidden();
  await expect(
    page.getByRole("button", { name: "Escolher tema" }),
  ).toBeFocused();
});

test("mobile menu opens, navigates, closes, and supports Escape", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Abrir menu" }).click();
  await expect(page.locator("#mobile-nav")).toBeVisible();
  await page
    .locator("#mobile-nav")
    .getByRole("link", { name: "Como funciona" })
    .click();
  await expect(page).toHaveURL(/#processo$/);
  await expect(page.locator("#mobile-nav")).toBeHidden();
  await page.getByRole("button", { name: "Abrir menu" }).click();
  await page.keyboard.press("Escape");
  await expect(page.locator("#mobile-nav")).toBeHidden();
  await expect(page.getByRole("button", { name: "Abrir menu" })).toBeFocused();
});

test("content fits mobile, tablet, notebook and desktop widths", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  for (const width of [320, 360, 390, 640, 768, 900, 1024, 1366, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(overflow, `Horizontal overflow at ${width}px`).toBe(false);
    for (const selector of [
      "h1",
      ".hero-actions",
      ".about-main",
      ".service-grid",
      ".steps",
      ".manifesto-content",
    ]) {
      const box = await page.locator(selector).boundingBox();
      expect(box.x, `${selector} left at ${width}px`).toBeGreaterThanOrEqual(0);
      expect(
        box.x + box.width,
        `${selector} right at ${width}px`,
      ).toBeLessThanOrEqual(width + 1);
    }
  }
});

for (const theme of ["light", "dark"]) {
  test(`accessible content and controls in ${theme} mode`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
    await page.goto("/");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });
}

test("fallback works without WebGL or storage and reduced motion disables scrolling animations", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce", colorScheme: "dark" });
  await page.addInitScript(() => {
    HTMLCanvasElement.prototype.getContext = () => null;
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new Error("Storage unavailable");
      },
    });
  });
  await page.goto("/");
  await expect(page.locator(".sculpture-fallback")).toBeVisible();
  await expect(page.locator("html")).toHaveCSS("scroll-behavior", "auto");
  await page.getByRole("button", { name: "Escolher tema" }).click();
  await page.getByRole("button", { name: "Claro" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.locator(".about-main h2")).toHaveCSS("opacity", "1");
});

test("scrolling reveals sections when motion is enabled", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.addInitScript(() => {
    HTMLCanvasElement.prototype.getContext = () => null;
  });
  await page.goto("/");
  const heading = page.locator("#processo h2");
  await expect(heading.locator("..")).not.toHaveClass(/is-visible/);
  await heading.scrollIntoViewIfNeeded();
  await expect(heading.locator("..")).toHaveClass(/is-visible/);
  await expect(heading.locator("..")).toHaveCSS("opacity", "1");
});
