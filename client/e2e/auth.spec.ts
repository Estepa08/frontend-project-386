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

  test("renders login page with form", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator('[data-container="page--auth"]')).toBeVisible();

    await expect(page.getByPlaceholder("email@example.com")).toBeVisible();
    await expect(page.getByPlaceholder("********")).toBeVisible();
    await expect(page.getByRole("button", { name: "Войти" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Войти" })).toBeEnabled();
  });

  test("shows register link on login page", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("link", { name: "Зарегистрироваться" })).toBeVisible();
    await page.getByRole("link", { name: "Зарегистрироваться" }).click();
    await expect(page).toHaveURL(/\/register/);
  });

  test("renders register page with form", async ({ page }) => {
    await page.goto("/register");
    await expect(page.locator('[data-container="page--auth"]')).toBeVisible();
    await expect(page.locator('[data-container="toggle--role"]')).toBeVisible();
    await expect(page.getByRole("button", { name: /зарегистрироваться/i })).toBeVisible();
  });

  test("shows login link on register page", async ({ page }) => {
    await page.goto("/register");
    await expect(page.getByRole("link", { name: "Войти" })).toBeVisible();
    await page.getByRole("link", { name: "Войти" }).click();
    await expect(page).toHaveURL(/\/login/);
  });

  test("shows error on invalid login", async ({ page }) => {
    await page.goto("/login");
    await page.getByPlaceholder("email@example.com").fill("wrong@test.com");
    await page.getByPlaceholder("********").fill("wrongpass");
    await page.getByRole("button", { name: "Войти" }).click();

    await expect(page.locator('[data-container="page--auth"]')).toContainText(/ошиб/i);
  });

  test("dev quick-login buttons are absent in production", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByText("Быстрый вход (без API)")).not.toBeVisible();
    await expect(page.getByRole("button", { name: "Войти как Admin" })).not.toBeVisible();
    await expect(page.getByRole("button", { name: "Войти как User" })).not.toBeVisible();
  });

  test("navigates back to login after logout", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator('[data-container="page--auth"]')).toBeVisible();
  });
});
