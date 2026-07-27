import { test, expect } from "@playwright/test";

test.describe.serial("Booking — full user flow", () => {
  test("Admin logs in, sets availability, creates meeting type", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator('[data-container="page--auth"]')).toBeVisible();
    await page.getByRole("button", { name: "Войти как Администратор" }).click();

    await expect(page).toHaveURL(/\/admin/, { timeout: 10000 });
    await expect(page.locator('[data-container="page--dashboard"]')).toBeVisible({ timeout: 10000 });

    // Navigate to availability and enable a workday before saving
    await page.getByRole("navigation").getByRole("link", { name: "График" }).click();
    await expect(page.locator('[data-container="page--availability"]')).toBeVisible({ timeout: 10000 });

    // Toggle Monday to ensure it's enabled in the payload
    const monCheckbox = page.getByLabel("Пн");
    await monCheckbox.uncheck();
    await monCheckbox.check();

    await page.getByRole("button", { name: "Сохранить" }).click();
    await expect(page.getByText("График сохранён")).toBeVisible({ timeout: 10000 });

    // Create a meeting type
    await page.getByRole("navigation").getByRole("link", { name: "Типы встреч" }).click();
    await expect(page.locator('[data-container="page--meeting-types"]')).toBeVisible();

    await page.getByRole("button", { name: "Создать" }).click();
    await expect(page.locator('[data-container="dialog--create-meeting-type"]')).toBeVisible();
    await page.getByText("15 мин").click();
    await page.getByText("Single").click();
    await page.getByRole("button", { name: "Создать" }).click();
    await expect(page.locator('[data-container="dialog--create-meeting-type"]')).not.toBeVisible();
    await expect(page.locator('[data-container="card--meeting-type"]')).toBeVisible({ timeout: 10000 });

    // Logout
    await page.getByRole("button", { name: "Выйти" }).click();
    await expect(page).toHaveURL(/\/login/);
  });

  test("User logs in and books a meeting", async ({ page }) => {
    // Login as user via mock
    await page.goto("/login");
    await page.getByRole("button", { name: "Войти как Клиент" }).click();

    await expect(page).toHaveURL(/\/user\/meets/, { timeout: 10000 });
    await expect(page.locator('[data-container="page--meets"]')).toBeVisible({ timeout: 10000 });

    // Navigate to booking via header nav
    await page.getByRole("navigation").getByRole("link", { name: "Забронировать" }).click();
    await expect(page.locator('[data-container="booking-wizard"]')).toBeVisible();
    await expect(page.locator('[data-container="step--select-admin"]')).toBeVisible();

    // Select the pre-seeded admin (Alice Johnson) by email
    await page.locator('[data-container="list--admins"] button').filter({ hasText: "admin@meetly.app" }).click();

    // Select the first meeting type
    await expect(page.locator('[data-container="step--date-time"]')).toBeVisible();
    await page.locator('[data-container="grid--meeting-types-choice"] button').first().click();

    // Wait for calendar to load, then click the first available day
    await expect(page.locator('[data-container="card--calendar"]')).toBeVisible();
    await page.waitForLoadState("networkidle");

    const availableDay = page.locator('[data-container="card--calendar"] td.font-semibold:not(.line-through) button').first();
    await availableDay.waitFor({ state: "visible", timeout: 15000 });
    await availableDay.click();
    await page.waitForLoadState("networkidle");

    // Click first time slot, then "Далее"
    await expect(page.locator('[data-container="grid--slots"] button').first()).toBeVisible({ timeout: 10000 });
    await page.locator('[data-container="grid--slots"] button').first().click();

    await page.getByRole("button", { name: "Далее" }).click();

    // Confirm booking
    await expect(page.locator('[data-container="step--confirm"]')).toBeVisible();
    await page.getByPlaceholder(/Например: Консультация/).fill("E2E Test Booking");
    await page.getByRole("button", { name: "Забронировать" }).click();

    // Verify success
    await expect(page.locator('[data-container="step--success"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('[data-container="card--success-summary"]')).toBeVisible();

    // Verify booking in meets list
    await page.getByRole("navigation").getByRole("link", { name: "Мои встречи" }).click();
    await expect(page.locator('[data-container="page--meets"]')).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole("cell", { name: "E2E Test Booking" })).toBeVisible();
  });
});
