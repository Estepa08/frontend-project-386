import { test, expect } from "@playwright/test";
import { selectRole } from "./helpers";

test.describe.serial("Booking — full user flow", () => {
  test("Owner sets availability", async ({ page }) => {
    await selectRole(page, "owner");
    await page.goto("/admin/availability");
    await expect(page.locator('[data-container="page--availability"]')).toBeVisible({ timeout: 10000 });

    // Enable every day so there's always an available date regardless of the test date
    for (const dayLabel of ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"]) {
      const checkbox = page.getByLabel(dayLabel);
      await checkbox.uncheck();
      await checkbox.check();
    }

    await page.getByRole("button", { name: "Сохранить" }).click();
    await expect(page.getByText("График сохранён")).toBeVisible({ timeout: 10000 });
  });

  test("Guest books a meeting", async ({ page }) => {
    await page.goto("/booking");
    await expect(page.locator('[data-container="booking-wizard"]')).toBeVisible();
    await expect(page.locator('[data-container="step--date-time"]')).toBeVisible();

    // Duration picker is visible with both 15 and 30 minutes enabled by default
    await expect(page.locator('[data-container="card--duration-picker"]')).toBeVisible();

    // Wait for calendar to load, then click the first available day
    await expect(page.locator('[data-container="card--calendar"]')).toBeVisible();
    await page.waitForLoadState("networkidle");

    const availableDay = page.locator('[data-container="card--calendar"] td.font-semibold:not(.line-through) button').first();
    await availableDay.waitFor({ state: "visible", timeout: 15000 });
    await availableDay.click();
    await page.waitForLoadState("networkidle");

    // Click first slot, then "Далее"
    await expect(page.locator('[data-container="grid--slots"] button').first()).toBeVisible({ timeout: 10000 });
    await page.locator('[data-container="grid--slots"] button').first().click();

    await page.getByRole("button", { name: "Далее" }).click();

    // Confirm booking
    await expect(page.locator('[data-container="step--confirm"]')).toBeVisible();
    await page.getByPlaceholder(/Например: Иван Петров/).fill("E2E Guest");
    await page.getByPlaceholder(/Например: Консультация по проекту/).fill("E2E Test Booking");
    await page.getByRole("button", { name: "Забронировать" }).click();

    // Verify success
    await expect(page.locator('[data-container="step--success"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('[data-container="card--success-summary"]')).toBeVisible();
  });

  test("Owner sees the booked meeting", async ({ page }) => {
    await selectRole(page, "owner");
    await page.goto("/admin/meets");
    await expect(page.locator('[data-container="page--meets"]')).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole("cell", { name: "E2E Test Booking" })).toBeVisible();
    await expect(page.getByRole("cell", { name: "E2E Guest" })).toBeVisible();
  });
});
