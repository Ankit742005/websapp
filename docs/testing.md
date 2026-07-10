# testing.md

## Running the suite

```bash
npm run test              # unit + integration (Vitest), single run
npm run test:watch         # same, watch mode
npm run test:coverage       # with a coverage report
npm run test:e2e             # end-to-end (Playwright)
npm run test:e2e:ui           # Playwright's interactive UI mode
```

`npm run test:e2e` starts its own dev server (`playwright.config.ts`'s `webServer`), reseeds the
database via `e2e/global-setup.ts` before the first test, and tears the server down when it's
done — no manual setup needed beyond `npm install` and a valid `.env`.

## What's covered, and why

**69 unit/integration tests.** Built for value, not a coverage percentage:

- `src/lib/auth/permissions.test.ts` — every role's abilities, `outranks()`, `assignableRoles()`
  never returning anything ranked above the actor. This is the file that decides who can do what;
  it has to be right.
- `src/lib/validations/*.test.ts` — exact boundary values (7 vs. 8 characters, 72 vs. 73 — not
  just "a valid one and an invalid one"), and rejecting enum values outside the known set.
- `src/lib/rate-limit.test.ts` — window reset uses `vi.useFakeTimers()` to advance time
  deterministically, not a real `setTimeout` sleep.
- `src/lib/auth/tokens.test.ts`, `password.test.ts` — hash determinism, per-hash salting, and
  the bcrypt cost-12 requirement asserted against the hash's own `$2b$12$` prefix.
- `test/integration/tenant-isolation.test.ts` — the one that matters most. A disposable SQLite
  file with the **real** Prisma migrations applied (`prisma migrate deploy`, not a mock), seeded
  with two organizations, asserting a query scoped to org A can never return org B's row — even
  when given org B's real id.

**12 E2E tests (Playwright).**

- `e2e/auth.spec.ts` — unauthenticated redirect (with the callback URL preserved), a wrong
  password producing a visible error and *not* a redirect, a correct login landing on the
  dashboard, and sign-out actually clearing the session.
- `e2e/tickets.spec.ts` — the brief's own example critical path: create a ticket, find it again
  through the list's server-side search, export it to CSV (asserting a real file download event
  and filename — not just that a button was clicked). Plus commenting and status-change
  persistence across a page reload.
- `e2e/rbac.spec.ts` — a Viewer doesn't see "New ticket"; the Settings sub-nav omits
  Organization/Members/Audit for a Viewer but shows all four for an Owner; and the one that
  actually proves something — **a Viewer who navigates straight to `/settings/members` by URL**
  gets the real not-found render, not just a page where a button happened to be hidden. A hidden
  control is not a security boundary; only a test that bypasses the UI proves the server agrees.

## Two things worth knowing before you extend this suite

1. **Don't race a redirect with a second navigation.** `e2e/helpers.ts`'s `login()` clicks
   submit and then `waitForURL(...)` — it deliberately does **not** call `page.goto()`
   immediately afterward. Starting a new navigation while one is still in flight cancels the
   pending one in the browser, which can discard the response carrying `Set-Cookie` before it's
   ever applied. This isn't a slow race that more retries fix — it's a navigation that never
   completes. If you add a new flow that follows a redirect, let Playwright observe it
   (`waitForURL`/`waitForLoadState`) rather than issuing a second `goto()`.
2. **The rate limiter has a test-only escape hatch.** A full E2E run reuses a handful of seeded
   accounts across many specs, all against one server process's in-memory bucket, and
   legitimately exceeds 5 login attempts. `src/lib/rate-limit.ts` checks
   `process.env.E2E_TESTING === "1"` — set only by `playwright.config.ts`'s `webServer.env` —
   and short-circuits to always-allow when it's set. It is not reachable from any real
   deployment; production behavior is unchanged.

## Adding a new test

- Pure logic (a new validation schema, a new permission rule) → a unit test next to the file it
  tests, following the existing `*.test.ts` naming.
- A new DAL query with tenant-scoping implications → add a case to
  `test/integration/tenant-isolation.test.ts` rather than starting a new integration file; it
  already pays the cost of setting up two seeded organizations.
- A new user-facing flow → an E2E spec in `e2e/`, reusing `login()` from `e2e/helpers.ts`.
