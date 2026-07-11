# Deskly — Submission Package

Digital Heroes Full Stack Developer Trial submission. This file is the single entry point for
reviewing this project; everything else in the repo is linked from here.

> **Candidate:** still need to deploy, record the demo video, or submit? →
> [**HOW_TO_SUBMIT.md**](HOW_TO_SUBMIT.md) is the step-by-step checklist, including the exact
> spoken script for the demo video.

## Links

| | |
| --- | --- |
| **Live deployment** | _add your deployed URL here after following [docs/deployment.md](../docs/deployment.md)_ |
| **GitHub repository** | https://github.com/Ankit742005/websapp |
| **Demo video** | _add your Loom link here after recording — script at [docs/demo-script.md](../docs/demo-script.md)_ |

## Before you submit — repository polish

Two things worth doing on GitHub itself (can't be scripted from inside the repo):

1. **Description + topics.** On the repo page → the gear icon next to "About" → set the
   description to the one-line pitch above, and add topics: `nextjs`, `typescript`, `prisma`,
   `helpdesk`, `saas`, `react`, `tailwindcss`, `vercel`.
2. **Pin it.** On your GitHub profile → Customize your pins → add this repo, so it's the first
   thing a reviewer sees.

## Demo credentials

No sign-up needed — the seeded accounts below all use the password `demo1234`:

| Email | Role | What it can do |
| --- | --- | --- |
| `owner@deskly.app` | Owner | Everything, including granting Owner/Admin and removing members |
| `demo@deskly.app` | Admin | Everything except granting Owner/Admin |
| `viewer@deskly.app` | Viewer | Read-only — no create/edit/delete, no Settings access beyond Profile |

## One-paragraph pitch

Deskly is a fast, keyboard-first helpdesk for lean support teams, built to demonstrate
end-to-end product engineering: multi-tenant data isolation backed by an integration test (not
just a convention), role-based access enforced on the server rather than hidden in the UI,
server-side search/filter/sort/pagination on a real data table, analytics computed from live
data, an immutable audit log, CSV/PDF export, a command palette, and a properly designed dark
mode — shipped with 81 automated tests, full SEO (structured data, OG images, sitemap), CI, and
documentation thorough enough that a stranger can clone it and understand every non-obvious
decision without asking me.

## Project summary

A multi-tenant customer-support ticketing system. Organizations have members (Owner/Admin/
Agent/Viewer), contacts (customers), and tickets (with comments, a timeline, and tags). Every
mutation is authorized server-side and recorded in an immutable audit log. Full detail in the
main [README.md](../README.md).

## Feature list

- Authentication — email/password (bcrypt cost 12), email verification, password reset, optional Google/GitHub OAuth
- Role-based access control — 4 roles, enforced server-side on every action
- Ticket CRUD — comments (internal notes vs. customer replies), full change timeline, soft delete
- Contact CRUD
- Server-side data table — debounced search, status/priority/assignee filters, column sort, pagination
- CSV export (filtered) and per-ticket PDF export
- Dashboard (KPIs + 3 charts + leaderboard) and a dedicated Analytics page with a 7/30/90-day range
- Settings — profile, organization, member management, paginated/filterable audit log
- Command palette (⌘K) with live server-searched results
- Dark mode, loading skeletons, empty/error states, toast notifications throughout
- Public marketing site — landing page, docs hub, FAQ — separate from the authenticated app
- Full SEO — per-route metadata, canonical tags, robots.txt, sitemap.xml, dynamic OG image and favicon, JSON-LD (SoftwareApplication, FAQPage, BreadcrumbList)
- 69 Vitest unit/integration tests + 12 Playwright E2E tests
- GitHub Actions CI (typecheck, lint, test, build, E2E)

## Tech stack

Next.js 16 (App Router) · TypeScript (strict) · Tailwind CSS v4 · shadcn/ui · Prisma 7 + libSQL
(SQLite dev, Turso production) · Auth.js v5 · Zod · React Hook Form · TanStack Query · Recharts ·
Vitest · Playwright · Vercel

## Architecture summary

Every domain table carries an `orgId`; every database query runs through a single data-access
layer (`src/lib/dal/`) that requires it as an explicit parameter — there is no code path that
queries domain data without a tenant scope. Server Actions handle every mutation, each following
the same contract: resolve the session, check `can(role, action)`, validate with Zod, write
scoped by `orgId`, record an audit-log entry, revalidate, return a typed result. Full write-up
with an ER diagram: [docs/architecture.md](../docs/architecture.md).

## Folder structure

```
deskly/
├── .github/            # CI workflow, issue/PR templates
├── docs/               # architecture, API, deployment, testing, decisions, case study, screenshots
├── e2e/                 # Playwright end-to-end specs
├── prisma/               # schema, migrations, seed script
├── public/                # static assets, screenshots used by the landing page
├── src/
│   ├── app/                 # Next.js routes — (marketing), (auth), (app) route groups + api/
│   ├── components/            # ui/ (shadcn primitives) + feature components
│   ├── lib/                     # auth, dal (data access), validations, constants, utils
│   └── generated/                 # Prisma client (gitignored, regenerated on install)
├── test/                # Vitest setup + the tenant-isolation integration test
├── SUBMISSION/            # this package
└── README.md
```

## Known limitations

- **No real email delivery.** Invites and password-reset links are surfaced directly in the UI
  (a "dev mode" banner with the link) rather than sent — there's no email provider wired up.
  Wiring one (Resend, Postmark) is a single function (`src/lib/email.ts`) away from real delivery.
- **Offset pagination, not keyset.** Fine at this app's actual data scale; documented as a known
  ceiling (not an oversight) in [docs/decisions.md](../docs/decisions.md).
- **Tags and saved views are modeled but not exposed in the UI.** The schema and relations exist
  and are migrated; the UI for managing them wasn't built in this trial's scope.
- **Single-instance rate limiting.** The in-memory limiter is correct for one server process
  behind Vercel's trusted edge; it wouldn't coordinate across multiple instances or survive a
  restart. Documented explicitly in the rate limiter's own doc comment rather than left implicit.
- **CI's E2E job hasn't been observed running on GitHub's hosted runners** — it was built by
  carefully matching the exact environment variables and migration commands verified locally,
  but a GitHub-hosted run has its own OS/network quirks that only surface by actually running
  there. Worth watching on the first real push.

## Future improvements

- Real-time updates (WebSocket/SSE) instead of client refetch after a mutation
- Saved filter views (UI on top of the existing `SavedView` schema)
- Tag management UI
- Real email delivery for invites, verification, and password reset
- A trusted-proxy allowlist for the rate limiter if self-hosting behind a non-Vercel proxy

## Time spent

Built across the trial's timebox as a series of vertical slices — schema and auth first, then
core CRUD, then the dashboard, then the data table, then UX polish, then settings/RBAC admin,
then tests, then docs and deploy config — each one verified end to end (typecheck, lint, build,
and actually clicking through the feature) before moving to the next. AI pair-programming tools
were used throughout, in line with the brief's own call to "work with AI like a pro, not a
crutch" — every generated diff was reviewed before being accepted, and nothing was called done on
a green build alone. That review process caught two real crash bugs a clean build had missed.

## Lessons learned

See the "What I learned" section of [docs/case-study.md](../docs/case-study.md) — in short,
that a passing build and a working feature are two different, non-substitutable claims, and the
gap between them is where every real bug in this project was hiding.
