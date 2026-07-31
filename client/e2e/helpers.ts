import type { Page } from "@playwright/test";

export async function selectRole(page: Page, role: "owner" | "user") {
  await page.goto("/");
  await page.locator(`[data-container="role-card--${role}"]`).click();
}

export async function selectCalendarDate(page: Page, target: Date) {
  const now = new Date();
  if (target.getFullYear() !== now.getFullYear() || target.getMonth() !== now.getMonth()) {
    await page.getByRole("button", { name: "Следующий месяц" }).click();
  }
  const isoDate = [
    target.getFullYear(),
    String(target.getMonth() + 1).padStart(2, "0"),
    String(target.getDate()).padStart(2, "0"),
  ].join("-");
  await page.locator(`[data-day="${isoDate}"] button`).click();
}
