import { test, expect } from "@playwright/test";
import { selectRole, selectCalendarDate } from "./helpers";

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
    await expect(page.locator('[data-container="page--booking-types"]')).toBeVisible();

    // A list of event types (название, описание, длительность) is shown
    await expect(page.locator('[data-container="grid--event-types"] button').first()).toBeVisible();

    // Select the first event type — the wizard opens with date and time step
    await page.locator('[data-container="grid--event-types"] button').first().click();
    await expect(page.locator('[data-container="booking-wizard"]')).toBeVisible();
    await expect(page.locator('[data-container="step--date-time"]')).toBeVisible();
    await expect(page.locator('[data-container="card--event-type-summary"]')).toBeVisible();

    // Pick a future date so there are always bookable slots regardless of the time of day
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 2);
    await selectCalendarDate(page, targetDate);

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
