import { test, expect } from "@playwright/test";
import { login, DEMO_USERS } from "./helpers";

/**
 * RBAC must hold on both sides: hidden in the UI *and* rejected by the
 * server if someone navigates straight to a URL. These tests check both,
 * since a control that's merely hidden is not actually a security boundary.
 */
test.describe("role-based access — viewer (read-only role)", () => {
  test.beforeEach(async ({ page }) => {
    await login(page, DEMO_USERS.viewer);
  });

  test("viewer does not see the New ticket action", async ({ page }) => {
    await page.goto("/tickets", { waitUntil: "networkidle" });
    await expect(page.getByRole("link", { name: "New ticket" })).not.toBeVisible();
  });

  test("viewer's settings nav omits Organization, Members, and Audit log", async ({ page }) => {
    await page.goto("/settings", { waitUntil: "networkidle" });
    const navText = await page.getByRole("navigation", { name: "Settings" }).innerText();
    expect(navText).not.toContain("Members");
    expect(navText).not.toContain("Organization");
    expect(navText).not.toContain("Audit log");
  });

  test("viewer hitting /settings/members directly gets a not-found, not the page", async ({
    page,
  }) => {
    // notFound() is called deep in the tree, after the shell has already
    // started streaming a 200 — the real security boundary is the rendered
    // not-found UI (and the absence of the members table), not the status.
    await page.goto("/settings/members", { waitUntil: "networkidle" });
    await expect(page.getByText("This page could not be found")).toBeVisible();
    await expect(page.locator("table")).toHaveCount(0);
  });

  test("viewer on a ticket detail page cannot change status or post a comment", async ({
    page,
  }) => {
    await page.goto("/tickets", { waitUntil: "networkidle" });
    await page.locator("table tbody tr td a").first().click();
    // A longer timeout than the 5s default — this can be the first hit on
    // /tickets/[id] in a fresh dev server and a cold Turbopack compile of a
    // dynamic route can outrun the default assertion window.
    await page.waitForURL(/\/tickets\/[a-z0-9]+$/, { timeout: 15_000 });

    // No status/priority/assignee Select — read-only dots instead.
    await expect(page.locator('[role="combobox"]')).toHaveCount(0);
    // No reply form.
    await expect(page.locator("textarea")).toHaveCount(0);
  });
});

test.describe("role-based access — owner (full access)", () => {
  test("owner's settings nav includes every section", async ({ page }) => {
    await login(page, DEMO_USERS.owner);
    await page.goto("/settings", { waitUntil: "networkidle" });
    const navText = await page.getByRole("navigation", { name: "Settings" }).innerText();
    for (const label of ["Profile", "Organization", "Members", "Audit log"]) {
      expect(navText).toContain(label);
    }
  });
});
