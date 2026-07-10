import type { Page } from "@playwright/test";

export const DEMO_USERS = {
  admin: { email: "demo@deskly.app", password: "demo1234" },
  owner: { email: "owner@deskly.app", password: "demo1234" },
  viewer: { email: "viewer@deskly.app", password: "demo1234" },
} as const;

/**
 * Logs in and waits for the resulting redirect to actually land. Deliberately
 * does NOT issue a competing `page.goto()` while that redirect is in flight —
 * doing so aborts the pending response before its Set-Cookie header is ever
 * applied, which permanently (not just slowly) loses the session. Let the
 * click's own navigation resolve on its own; `waitForURL` just observes it.
 */
export async function login(
  page: Page,
  user: { email: string; password: string } = DEMO_USERS.admin,
): Promise<void> {
  await page.goto("/login", { waitUntil: "networkidle" });
  await page.getByLabel("Email").fill(user.email);
  await page.getByLabel("Password").fill(user.password);
  await page.getByRole("button", { name: "Sign in" }).click();

  await page.waitForURL((url) => url.pathname === "/dashboard", { timeout: 15_000 });
  await page.waitForLoadState("networkidle");
}
