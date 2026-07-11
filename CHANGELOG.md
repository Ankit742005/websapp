# Changelog

All notable changes to this project are documented here. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); this project follows
[Semantic Versioning](https://semver.org/).

## [1.0.0] - 2026-07-10

### Added

- **Authentication** — email/password with bcrypt (cost 12), sessions via signed JWT/`httpOnly`
  cookies, email verification, single-use hashed password-reset tokens, and optional Google/GitHub
  OAuth (enabled only when configured).
- **Multi-tenant data model** — organizations, users, contacts, tickets, comments, tags, an
  immutable audit log, and saved views, with every domain query scoped through a single
  org-aware data-access layer.
- **Role-based access control** — Owner/Admin/Agent/Viewer, enforced server-side in every
  action; only an Owner can grant Owner or Admin; the last Owner can never be demoted or removed.
- **Ticket CRUD** — creation, editing, soft delete, threaded comments (with internal-note vs.
  customer-visible reply), and a full per-ticket timeline of status/priority/assignment changes.
- **Data table** — server-side, URL-driven search, filter (status/priority), sort, and
  pagination on the ticket list.
- **Exports** — CSV of the current filtered ticket view; a per-ticket PDF.
- **Dashboard & analytics** — KPI cards, a ticket-volume trend chart, status/priority
  breakdowns, and an agent leaderboard, with an adjustable 7/30/90-day range on the dedicated
  Analytics page.
- **Settings** — profile (name/avatar/password), organization (rename), member management
  (add/change role/remove), and a paginated, entity-filterable audit log viewer.
- **UX polish** — a command palette (⌘K) with live server-searched results, a properly designed
  dark mode (not an inverted filter), loading skeletons, empty/error states, and toast
  notifications throughout.
- **Marketing site** — a real landing page, a docs hub (getting started / features /
  deployment), and an FAQ page, separate from the authenticated app shell.
- **SEO** — per-route metadata and canonical tags, `robots.txt`, `sitemap.xml`, a dynamically
  generated Open Graph image and favicon set, and JSON-LD (SoftwareApplication, FAQPage,
  BreadcrumbList).
- **Testing** — 69 Vitest unit/integration tests (including a real-database tenant-isolation
  integration test) and 12 Playwright end-to-end tests covering auth, the core ticket lifecycle,
  and RBAC enforcement against direct URL navigation.
- **CI** — GitHub Actions running typecheck, lint, unit tests, and a production build on every
  push and pull request.

### Fixed

- A Server Component in the app shell (`Topbar`) was passing an event handler directly to a
  child element, which crashed every authenticated page load under React's Server/Client
  Component serialization rules. Extracted the interactive piece into its own client component.
- The command palette (`cmdk`) crashed on the first keystroke — the generated `CommandDialog`
  wrapper never rendered the `Command` root its child components read their store from.
- A member-management E2E/manual-test helper was calling `page.goto()` immediately after
  submitting the login form, which raced (and could permanently cancel) the in-flight redirect
  carrying the session cookie. Replaced with `waitForURL`.

[1.0.0]: https://github.com/Ankit742005/websapp/releases/tag/v1.0.0
