import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("shows 404 page for unknown routes", async ({ page }) => {
    await page.goto("/nonexistent-route-12345");
    await expect(page.locator('[data-container="page--not-found"]')).toBeVisible();
    await expect(page.getByText("Страница не найдена")).toBeVisible();
  });

  test("booking page is public and wrapped in main layout", async ({ page }) => {
    await page.goto("/booking");
    await expect(page.locator('[data-container="layout--root"]')).toBeVisible();
    await expect(page.locator('[data-container="booking-wizard"]')).toBeVisible();
  });

  test("admin dashboard is accessible without login", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.locator('[data-container="page--dashboard"]')).toBeVisible();
  });

  test("root redirects to booking", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/booking/);
  });
});
