# Case study: Deskly

## Problem

Small support teams are stuck choosing between two bad options: a spreadsheet (no workflow, no
audit trail, breaks the moment two people edit it at once) or an enterprise helpdesk sized for a
500-person company (seat-based pricing, a fifteen-step setup wizard, and half the surface area
locked behind a higher tier). Neither is built for a five-person team that just wants to triage
tickets, see whether they're keeping up, and know who changed what.

## Approach

**Why a helpdesk, specifically.** Among the categories on the table, a helpdesk was the one
product that naturally demanded *every* evaluation axis without feeling contrived: real RBAC
(who can resolve a ticket vs. who can only view one), a data model with genuine relationships
(organization → users/contacts → tickets → comments/events/audit), analytics that mean
something (resolution rate, response time — not vanity counters), and a table-heavy UI that's
the actual test of whether search/filter/sort/pagination were built server-side or faked with a
client-side array.

**Data model first.** The schema — and specifically the tenancy boundary (every domain table
carries an `orgId`, every DAL query is scoped by it) — was locked before any UI code, on the
theory that a wrong data model is the most expensive kind of rework. That boundary is the one
piece of the system with its own integration test rather than just code review, because it's
the one bug class ("did I forget a `where: { orgId }`") that's invisible in a demo and
catastrophic in production.

**Milestones, not one big push.** The build ran as a sequence of vertical slices — schema and
auth, then core CRUD, then dashboard, then the data table, then UX polish, then settings/RBAC
admin, then tests, then docs and deploy config — each one verified end-to-end (typecheck, lint,
build, and *actually clicking through the feature in a browser*) before starting the next. A
green build was never treated as proof a feature worked; several real bugs (a crashed page, a
crashed command palette) shipped clean builds and were only caught by driving the app.

**AI-assisted, reviewed like a junior's PR.** I used AI pair-programming tools throughout, but
every diff got read before it was accepted, and nothing was marked done on the strength of a
clean build alone — a green `npm run build` was treated as necessary, never sufficient. That
discipline caught two real crash bugs a passing build had missed, plus a dropped devDependency
that would have broken `npm test` on a fresh clone. Trust nothing until you've clicked it — that
single habit is responsible for more of this project's quality than any individual line of code.

## Result

A working, multi-tenant helpdesk: authentication, RBAC enforced server-side, ticket CRUD with a
full audit trail, a server-side data table (search/filter/sort/paginate/export), a dashboard and
a deeper analytics view, settings with member management, a command palette, a properly designed
dark mode, 69 unit/integration tests plus 12 E2E tests, and a documented, one-command deploy path
to Vercel + Turso. See the [README](../README.md) for the live demo link and the full feature
list, and [docs/architecture.md](architecture.md) for how the tenancy boundary actually works.

**What I'd build next:** real-time updates instead of client refetch (WebSocket/SSE), saved
filter views (the schema already supports them), and actual email delivery for invites and
notifications — today those surface a link in-app instead, which is honest about being a demo
constraint rather than a finished feature.

## What I learned

The most valuable single decision was treating "the build passed" and "the feature works" as two
separate, non-substitutable claims. Every milestone in this build had at least one moment where
`npm run build` was green and the feature was still broken at runtime — a Server Component
illegally passing an event handler to a child, a missing context provider that only failed on
the first keystroke, a test helper that raced its own navigation and silently discarded a
session cookie. None of those would show up in a type-checker or a linter; all of them would
show up in thirty seconds of actually using the page. The build is necessary. It was never
sufficient.
