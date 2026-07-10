# Deskly

> A fast, keyboard-first helpdesk for lean support teams — real analytics, role-based access, and a ticket queue that never feels like it's fighting you.

![Deskly dashboard](docs/screenshots/dashboard.png)

[![CI](https://github.com/soulrahulrk/deskly/actions/workflows/ci.yml/badge.svg)](https://github.com/soulrahulrk/deskly/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**Live demo →** _add your deployed URL here after deploying (see [docs/deployment.md](docs/deployment.md))_

Built for the Digital Heroes Full Stack Developer Trial.

## Features

- **Ticketing** — create, assign, and comment on tickets, with internal notes kept separate from customer-visible replies
- **Server-side search, filter, sort, and pagination** — URL-driven, debounced, works on real data volume, not a client-side array
- **Analytics** — KPIs, a volume trend chart, status/priority breakdowns, and an agent leaderboard, computed from real ticket data with an adjustable 7/30/90-day range
- **Role-based access, enforced on the server** — Owner, Admin, Agent, Viewer, with real limits (only an Owner grants Owner/Admin; the last Owner can never be demoted or removed)
- **Immutable audit log** — every mutation recorded with who, what, when, and a before/after snapshot, queryable per entity
- **CSV and PDF export** — respects whatever filters are currently active
- **Command palette** (⌘K) and full keyboard support
- **Dark mode** — properly designed (elevated surfaces, desaturated accents), not an inverted filter

## Tech Stack

Next.js 16 (App Router) · TypeScript (strict) · Tailwind CSS v4 · shadcn/ui · Prisma 7 + libSQL (SQLite locally, Turso in production) · Auth.js v5 · Zod · React Hook Form · TanStack Query · Recharts · Vitest · Playwright · Vercel

## Quick Start

```bash
git clone https://github.com/soulrahulrk/deskly.git
cd deskly
cp .env.example .env      # then run: npx auth secret — paste the output into AUTH_SECRET
npm install
npm run db:migrate && npm run db:seed
npm run dev                # http://localhost:3000
```

No Postgres, no Docker, no external services — the database is a local SQLite file via the same libSQL driver adapter used in production.

### Demo login

Reviewers don't need to register — sign in directly with the seeded admin account:

| Email                | Password   | Role   |
| --------------------- | ---------- | ------ |
| `demo@deskly.app`    | `demo1234` | Admin  |
| `owner@deskly.app`   | `demo1234` | Owner  |
| `viewer@deskly.app`  | `demo1234` | Viewer |

## Environment Variables

| Variable                                 | Required | Description                                                              |
| ------------------------------------------ | -------- | -------------------------------------------------------------------------- |
| `DATABASE_URL`                           | Yes      | SQLite `file:` path locally, or a `libsql://` Turso URL in production      |
| `DATABASE_AUTH_TOKEN`                    | No       | Auth token for a remote Turso database; leave empty for a local file DB    |
| `AUTH_SECRET`                            | Yes      | Session/JWT signing secret — generate with `npx auth secret`               |
| `AUTH_URL`                                | No       | Public origin used by Auth.js callbacks (needed in production)             |
| `NEXT_PUBLIC_APP_URL`                    | Yes      | Absolute base URL — powers canonical tags, the OG image, and the sitemap   |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`  | No       | Enables Google sign-in when both are set                                   |
| `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET`  | No       | Enables GitHub sign-in when both are set                                   |

See [.env.example](.env.example) for the full template.

## Architecture

Multi-tenant (organization-scoped) helpdesk. Every database query runs through a single data-access layer that filters by `orgId`, so a query can never cross a tenant boundary by accident — that property has its own integration test. Authorization is checked twice: once in the UI (to hide controls) and again on the server inside every action (the source of truth). Full write-up, including the ER diagram, in [docs/architecture.md](docs/architecture.md).

## API

Every server action and route handler — method/path, inputs, output shape, and auth requirement — is documented in [docs/API.md](docs/API.md).

## Testing

```bash
npm run test        # unit + integration (Vitest) — 69 tests
npm run test:e2e     # end-to-end (Playwright) — 12 tests
npm run typecheck     # strict TypeScript, zero `any`
npm run lint           # ESLint
```

The integration suite spins up a disposable SQLite database with the real migrations applied and asserts org A can never see org B's data — not mocked. Full breakdown in [docs/testing.md](docs/testing.md).

## Screenshots

| Dashboard | Tickets |
| --- | --- |
| ![Dashboard](docs/screenshots/dashboard.png) | ![Tickets](docs/screenshots/tickets.png) |

| Ticket detail | Analytics |
| --- | --- |
| ![Ticket detail](docs/screenshots/ticket-detail.png) | ![Analytics](docs/screenshots/analytics.png) |

| Command palette | Dark mode |
| --- | --- |
| ![Command palette](docs/screenshots/command-palette.png) | ![Dark mode](docs/screenshots/dashboard-dark.png) |

## Deployment

Deploys to Vercel in a few minutes, with a Turso database for persistence. Full guide: [docs/deployment.md](docs/deployment.md) (also available in-app at `/docs/deployment`).

## Roadmap

- [x] Auth, RBAC, and multi-tenant data isolation
- [x] Ticket CRUD, comments, and per-ticket timeline
- [x] Server-side search/filter/sort/pagination, CSV + PDF export
- [x] Dashboard and analytics
- [x] Settings, member management, and a queryable audit log
- [x] Unit, integration, and E2E test coverage
- [ ] Real-time updates (WebSocket/SSE) instead of client refetch
- [ ] Saved filter views
- [ ] Email delivery for invites and notifications (currently surfaces the link in-app)

## Documentation

- [docs/architecture.md](docs/architecture.md) — data model, ER diagram, auth/authz
- [docs/API.md](docs/API.md) — every server action and route handler
- [docs/deployment.md](docs/deployment.md) — Vercel + Turso deployment guide
- [docs/testing.md](docs/testing.md) — how to run and extend the test suite
- [docs/decisions.md](docs/decisions.md) — non-obvious decisions and their trade-offs
- [docs/case-study.md](docs/case-study.md) — problem, approach, result, what I learned
- [CONTRIBUTING.md](CONTRIBUTING.md) · [CHANGELOG.md](CHANGELOG.md)

## License

MIT — see [LICENSE](LICENSE).
