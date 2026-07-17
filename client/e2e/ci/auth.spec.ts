import { test, expect } from "@playwright/test";

test.describe("Authentication — CI", () => {
  test("logs in with mock credentials and redirects to admin dashboard", async ({ page }) => {
    await page.goto("/login");
    await page.getByPlaceholder("email@example.com").fill("admin@meetly.app");
    await page.getByPlaceholder("********").fill("any-password");
    await page.getByRole("button", { name: "Войти", exact: true }).click();
    await expect(page).toHaveURL(/\/admin/);
    await expect(page.locator('[data-container="page--dashboard"]')).toBeVisible();
  });

  test("dev quick-login buttons are visible", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByText("Быстрый вход (без API)")).toBeVisible();
    await expect(page.getByRole("button", { name: "Войти как Admin" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Войти как User" })).toBeVisible();
  });
});
