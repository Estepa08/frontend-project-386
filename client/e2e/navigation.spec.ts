import { test, expect } from "@playwright/test";
import { selectRole } from "./helpers";

test.describe("Navigation", () => {
  test("shows 404 page for unknown routes", async ({ page }) => {
    await page.goto("/nonexistent-route-12345");
    await expect(page.locator('[data-container="page--not-found"]')).toBeVisible();
    await expect(page.getByText("Страница не найдена")).toBeVisible();
  });

  test("root shows role selection page", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('[data-container="page--landing"]')).toBeVisible();
    await expect(page.locator('[data-container="role-card--owner"]')).toBeVisible();
    await expect(page.locator('[data-container="role-card--user"]')).toBeVisible();
  });

  test("booking page is public and wrapped in main layout", async ({ page }) => {
    await page.goto("/booking");
    await expect(page.locator('[data-container="layout--root"]')).toBeVisible();
    await expect(page.locator('[data-container="page--booking-types"]')).toBeVisible();
  });

  test("admin dashboard requires owner role", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/$/);

    await selectRole(page, "owner");
    await expect(page.locator('[data-container="page--dashboard"]')).toBeVisible();
  });

  test("user role cannot access admin routes", async ({ page }) => {
    await selectRole(page, "user");
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/$/);
  });

  test("header shows switch-role button and switches back to landing", async ({ page }) => {
    await selectRole(page, "owner");
    await expect(page.locator('[data-container="page--dashboard"]')).toBeVisible();

    await page.locator('[data-container="header--switch-role"]').click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator('[data-container="page--landing"]')).toBeVisible();
  });
});
