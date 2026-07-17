import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("shows 404 page for unknown routes", async ({ page }) => {
    await page.goto("/nonexistent-route-12345");
    await expect(page.locator('[data-container="page--not-found"]')).toBeVisible();
    await expect(page.getByText("Страница не найдена")).toBeVisible();
  });

  test("login page is not wrapped in main layout", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator('[data-container="layout--root"]')).not.toBeVisible();
  });

  test("redirects /admin to /login for guest", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/login/);
  });

  test("redirects /booking to /login for guest", async ({ page }) => {
    await page.goto("/booking");
    await expect(page).toHaveURL(/\/login/);
  });

  test("redirects /user to /login for guest", async ({ page }) => {
    await page.goto("/user");
    await expect(page).toHaveURL(/\/login/);
  });
});
