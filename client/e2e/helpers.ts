import type { Page } from "@playwright/test";

export async function selectRole(page: Page, role: "owner" | "user") {
  await page.goto("/");
  await page.locator(`[data-container="role-card--${role}"]`).click();
}
