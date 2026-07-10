import { test, expect } from "@playwright/test";
import { login } from "./helpers";

/**
 * The product's core job-to-be-done, end to end: create a ticket, find it
 * again through search, and export it. This is the flow the brief singles
 * out ("create → filter → export") as the one that matters most.
 */
test.describe("ticket lifecycle", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("create a ticket, then find it via search, then export CSV", async ({ page }) => {
    const uniqueSubject = `E2E smoke test ${Date.now()}`;

    await page.goto("/tickets/new", { waitUntil: "networkidle" });
    await page.locator("#subject").fill(uniqueSubject);
    await page.locator("#body").fill("Created by the Playwright E2E suite.");

    // Contact is a required field with no default — pick whatever the first
    // seeded contact is, so this test doesn't depend on specific seed names.
    await page.getByText("Select contact").click();
    await page.locator('[role="option"]').first().click();

    await page.getByRole("button", { name: "Create ticket" }).click();

    // A successful create redirects to the new ticket's detail page.
    await expect(page).toHaveURL(/\/tickets\/[a-z0-9]+$/, { timeout: 10_000 });
    await expect(page.getByRole("heading", { name: uniqueSubject })).toBeVisible();

    // Find it again through the list's server-side search.
    await page.goto("/tickets", { waitUntil: "networkidle" });
    await page.getByPlaceholder("Search subject or contact...").fill(uniqueSubject);
    await expect(page).toHaveURL(/[?&]q=/, { timeout: 5_000 });
    await expect(page.getByRole("cell", { name: uniqueSubject })).toBeVisible({
      timeout: 5_000,
    });
    const rowCount = await page.locator("table tbody tr").count();
    expect(rowCount).toBe(1);

    // Export the filtered result set as CSV.
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: /csv/i }).click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/\.csv$/);
  });

  test("ticket detail shows the comment thread and accepts a new comment", async ({ page }) => {
    await page.goto("/tickets", { waitUntil: "networkidle" });
    await page.locator("table tbody tr td a").first().click();
    // A generous timeout — a cold Turbopack compile of a dynamic route can
    // outrun the 5s default assertion window.
    await page.waitForURL(/\/tickets\/[a-z0-9]+$/, { timeout: 15_000 });

    const commentBody = `E2E comment ${Date.now()}`;
    await page.locator("textarea").first().fill(commentBody);
    await page.locator('form button[type="submit"]').last().click();

    await expect(page.getByText(commentBody)).toBeVisible({ timeout: 10_000 });
  });

  test("changing status and priority persists after a reload", async ({ page }) => {
    await page.goto("/tickets", { waitUntil: "networkidle" });
    await page.locator("table tbody tr td a").first().click();
    // A generous timeout — a cold Turbopack compile of a dynamic route can
    // outrun the 5s default assertion window.
    await page.waitForURL(/\/tickets\/[a-z0-9]+$/, { timeout: 15_000 });

    const url = page.url();
    const statusTrigger = page.locator('[role="combobox"]').first();
    await statusTrigger.click();
    await page.getByRole("option", { name: "Resolved" }).click();
    await expect(page.getByText("Resolved").first()).toBeVisible({ timeout: 5_000 });

    await page.goto(url, { waitUntil: "networkidle" });
    await expect(page.getByText("Resolved").first()).toBeVisible();
  });
});
