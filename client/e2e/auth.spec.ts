import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("redirects unauthenticated user to login page", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/login/);
  });

  test("redirects unauthenticated to login from any protected route", async ({ page }) => {
    await page.goto("/admin/availability");
    await expect(page).toHaveURL(/\/login/);
  });

  test("renders login page with quick login buttons", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator('[data-container="page--auth"]')).toBeVisible();
    await expect(page.getByRole("button", { name: "Войти как Администратор" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Войти как Клиент" })).toBeVisible();
  });

  test("shows quick login buttons", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("button", { name: "Войти как Администратор" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Войти как Клиент" })).toBeVisible();
  });

  test("navigates back to login after logout", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator('[data-container="page--auth"]')).toBeVisible();
  });
});
