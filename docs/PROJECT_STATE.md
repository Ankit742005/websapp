# PROJECT_STATE.md — Single Source of Truth

> **Purpose.** This file is the durable memory of the build. If context is ever lost,
> a new session can read this file top-to-bottom and continue with zero ambiguity.
> It is updated at the end of every milestone. **Never delete history — append.**

---

## 0. TL;DR (read this first)

- **Product:** `Deskly` — a multi-tenant customer-support / helpdesk SaaS (Zendesk/Intercom-class, Linear-grade UI).
- **Why this project:** maximises coverage of every evaluation axis (RBAC, CRUD, dashboards, analytics, search/filter/sort/paginate, CSV+PDF export, audit log, settings, responsive, docs, deploy). See `MASTER_REQUIREMENTS.md §Project Selection`.
- **Stack:** Next.js 15 (App Router) · TypeScript strict · TailwindCSS · shadcn/ui · Prisma · SQLite (dev) → PostgreSQL/Supabase (prod) · Auth.js v5 · Zod · React Hook Form · TanStack Query · Recharts · Vitest · Playwright.
- **Deployment posture:** *deploy-ready, user deploys.* Everything is one-command deployable (Vercel + Supabase), with env templates, CI, and a deploy guide. No live credentials used in this session.
- **Local DB choice:** SQLite for dev so the app **actually runs and is verified**; documented one-line switch to Postgres for prod (`prisma/README.md`).

---

## 1. Environment (verified this session)

| Tool   | Version        | Notes                                   |
|--------|----------------|-----------------------------------------|
| Node   | v22.18.0       | OK for Next 15                          |
| npm    | 11.6.0         | Package manager (no pnpm available)     |
| git    | 2.50.1.windows | Repo not yet initialised                |
| docker | not installed  | → SQLite for local DB, no local Postgres|
| OS     | Windows 11     | Shell: PowerShell + Git Bash            |

**Implications:** use `npm`, use SQLite locally, avoid Docker-only tooling, keep all scripts cross-platform (no bash-only npm scripts).

---

## 2. Key decisions & rationale (Decision Log — append only)

| # | Decision | Rationale | Alternatives rejected |
|---|----------|-----------|-----------------------|
| D1 | Project = Helpdesk SaaS (`Deskly`) | Richest fit for all evaluation axes; reference UX bar (Linear/Intercom) matches the brief | ATS (more complex), Invoicing (narrow RBAC), Todo/Weather/Chat (explicitly banned) |
| D2 | SQLite dev / Postgres prod | Verifiable locally with zero infra; trivial prod switch | Postgres-only (no local DB infra available), Docker (not installed) |
| D3 | Enums as string-union + Zod, not Prisma native enums | SQLite doesn't support native enums; single source of truth in `lib/constants` keeps schema portable | Prisma enums (locks to Postgres, breaks local dev) |
| D4 | Auth.js v5 (credentials + optional OAuth) | Session/JWT, middleware RBAC, works on Vercel edge; credentials keeps demo login frictionless | Clerk/Auth0 (external dependency, less to demonstrate) |
| D5 | Server Actions + Route Handlers hybrid | Actions for mutations (progressive enhancement), Route Handlers for the public REST-ish API + exports | tRPC (adds surface without payoff for a trial) |
| D6 | Multi-tenant via `Organization` | Demonstrates real SaaS data-isolation & maturity | Single-tenant (weaker signal) |
| D7 | TanStack Query for client cache + optimistic updates | Required by brief; pairs with Server Actions for mutations | SWR (fine, but brief names TanStack) |
| D8 | Tenancy enforced in a data-access layer (`lib/dal`) | Every query is org-scoped in one place → no accidental cross-tenant leak | ad-hoc `where` clauses (leak risk) |

---

## 3. Milestone tracker

| M | Name | Status | Exit criteria |
|---|------|--------|---------------|
| M0 | Foundation & planning docs | ✅ DONE | This file + MASTER_REQUIREMENTS + plan + research written |
| M1 | Scaffold (Next/TS/Tailwind/shadcn/Prisma/Auth) | ✅ DONE | build green; tokens+providers+headers; pushed to GitHub |
| M2 | Data model & auth (schema, seed, RBAC) | ✅ DONE | schema+migration+seed verified; Auth.js+RBAC+proxy build green |
| M3 | Core CRUD (tickets, comments, contacts) | ✅ DONE | app shell + auth pages + create/read/update/delete ticket end-to-end |
| M4 | Dashboard & analytics | ✅ DONE | KPIs + ≥3 charts render from real data |
| M5 | Data table (search/filter/sort/paginate/export) | ✅ DONE | URL-driven table; CSV + PDF download work |
| M6 | UX polish (⌘K, dark mode, states, a11y) | ✅ DONE | Command palette + all 5 UI states + keyboard nav |
| M7 | Settings, profile, members/RBAC, audit log | 🔜 NEXT | Role changes gated; audit log records mutations |
| M8 | Testing (Vitest + Playwright) | ⬜ | Unit+integration+E2E green in CI |
| M9 | Docs & deploy (README/SEO/CI/SUBMISSION) | ⬜ | All docs + SEO assets + CI + SUBMISSION/ present |
| M10 | Final QA + self-review ≥95/100 | ⬜ | Line-by-line audit complete; score ≥95 |

---

## 4. Current status

- **Active milestone:** M6 done, audited, and hardened → M7 next
- **Last action:** Claude Code audited Antigravity's M3–M6 work by actually running the app
  end-to-end (Playwright against a live dev server), found and fixed two real crash bugs plus a
  dropped-devDependencies regression from M1; see §8 for full detail.
- [x] M0: Project initialization (Next.js, Tailwind v4, linting)
- [x] M1: Core architecture (Prisma adapter, directory structure)
- [x] M2: Auth & Tenancy (Auth.js, org-scoped DAL, Seed script)
- [x] M3: App shell & core CRUD (Tickets, Contacts, Auth pages)
- [x] M4: Dashboard & Analytics
- [x] M5: Rich Data Tables (search/filter/sort/paginate/export — all verified server-side & URL-driven)
- [x] M6: UX Polish (Command palette, dark mode, mobile responsive — all verified working post-fix)
- [ ] M7: Settings & RBAC (Team management, audit log viewer)
- [ ] M8: Testing & CI
- [ ] M9: Docs & Deploy (Landing page, Turso, Vercel)

## Current status (Last Updated: post-M6 audit)

M3–M6 are complete **and independently verified by actually running the application**, not just by
reading the code or trusting green builds. Two real crash bugs were found and fixed (see §8): a
Server/Client Component boundary violation that broke every authenticated page load, and a missing
`<Command>` root that crashed the command palette on the first keystroke. Both are now confirmed
fixed via a fresh Playwright run with zero console/page errors. `typecheck`, `lint`, and `build` are
green. The dev/test tooling gap from M1 (vitest/playwright/testing-library/prettier/tsx silently
missing from `package.json`) has been repaired so M8 can proceed without re-discovering it.

---

## 5. Assumptions (to reconcile if the real brief arrives)

1. No hard time-box given → optimise for demonstrated breadth + depth, not raw speed.
2. Deployment target is Vercel + Supabase (most common, best DX). Swappable.
3. A single demo Organization is seeded; the model supports many.
4. "Export PDF" = server-generated PDF of the current filtered ticket view + a per-ticket PDF.
5. English-only, no i18n required (structure allows adding it).

---

## 6. How to resume (for a future session)

1. Read this file §3–§4.
2. `npm install` at repo root.
3. `cp .env.example .env` and set `DATABASE_URL="file:./dev.db"` + `AUTH_SECRET`.
4. `npm run db:reset` (migrate + seed).
5. `npm run dev` → http://localhost:3000, log in with the demo creds in `SUBMISSION/README.md`.
6. Continue from the "Next action" in §4.

---

## 7. BRIEF RECONCILIATION (authoritative — supersedes earlier assumptions)

> The real Digital Heroes brief (`Digital_Heroes_Full_Stack_Developer_Trial.pdf`, "The Builder's
> Handbook") was received mid-M0 and read in full. It **validates the stack and approach** and adds
> hard requirements. This section is the source of truth where it conflicts with §0–§6.

**Confirmed by brief:** Next.js App Router · TS strict (no `any`) · Tailwind · shadcn/ui · Postgres
(Supabase/Neon) **or SQLite for simple apps** · Prisma · Auth.js · Zod on every boundary · Vercel ·
TanStack Query / server actions · ESLint+Prettier+Vitest/Playwright+GitHub Actions. Milestone builds,
spec-first, schema-first, 4-states-first, ⌘K palette — all already planned.

**Environment reality (locked after scaffold):** create-next-app installed **Next.js 16.2.10 · React
19.2.4 · Tailwind v4**. Next 16 has breaking changes vs. training data — consult
`node_modules/next/dist/docs/` before writing app code. Remove scaffold's `AGENTS.md`/`CLAUDE.md` from
the public repo (reads as AI scaffolding).

**Database (final):** `provider = "sqlite"` committed → zero-service local run for reviewers. Prisma
client uses the **libSQL driver adapter** so production runs on **Turso** (SQLite-compatible,
serverless, persistent, free tier) with the *identical* schema. `docs/deployment.md` also documents the
one-line switch to Postgres/Supabase. Rationale: max verifiability + brief's zero-friction demand +
real persistence on Vercel.

**New decisions from the brief:**

| # | Decision | Driven by brief section |
|---|----------|-------------------------|
| D9  | Roles = **OWNER · ADMIN · AGENT · VIEWER** (4) | §08 "owner/admin/member/viewer" |
| D10 | **Email verification** gates write access; **password reset** via single-use hashed token (20-min TTL, invalidated on use) | §08 Auth & Access |
| D11 | **OAuth Google + GitHub** via Auth.js, lit up when env present; passwords hashed with **bcrypt cost 12** (pure-JS `bcryptjs`, serverless-safe; meets "bcrypt ≥12") | §08 |
| D12 | **Keyset/cursor pagination** on `(sortKey, id)`; default page size 25, hard cap 100 | §08 Finding Data |
| D13 | **Soft-delete** (`deletedAt`) on Ticket; mutations return the mutated record | §08 Data & CRUD |
| D14 | **Security headers** (CSP, HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy) in `next.config`; CSRF via Auth.js + same-site + server-action origin checks | §08 Trust & Safety |
| D15 | **`src/` directory** layout: `src/{app,components,lib,server,types}` | §10 Repo Structure |
| D16 | Full **SEO**: per-route metadata, canonical, robots.ts, sitemap.ts, `opengraph-image.tsx` (ImageResponse 1200×630), Twitter cards, JSON-LD (SoftwareApplication + FAQPage + BreadcrumbList), self-hosted **Inter** via `next/font` | §14 SEO |
| D17 | Public **marketing surface**: real landing page (H1 value prop, features, screenshots, one CTA) + docs pages + FAQ; app lives under `(app)` group behind auth | §14 Content & Discovery |
| D18 | **Streamed** CSV/PDF export (survive 30s gateway); **bulk actions** with select-all-across-pages + confirm; keyboard `⌘K`, `j/k`, `/`, `?` cheat-sheet | §08 Beyond Basics |
| D19 | Deliverables: demo login in README, **credit Digital Heroes**, `docs/case-study.md`, `docs/demo-script.md` (60–90s), tagged **v1.0.0** | §11, §16, §22 |

**Evaluation weights (score budget — spend accordingly, M10):**
Product Quality & Functionality **20** · UI/UX Craft **15** · Code Quality & Architecture **15** ·
Deployment & Reliability **12** · Documentation **10** · GitHub Professionalism **10** ·
SEO & Discoverability **10** · Originality & Attention to Detail **8**.

**Hard rules (non-negotiable):** TS strict · real DB (not localStorage) · real auth · server-side
validation · secrets only in env. **Common-mistake avoidance:** no default README · no single squashed
commit (atomic conventional commits) · deploy survives hard refresh · OG image renders · zero console
errors/warnings · all 4 states everywhere · responsive from 320px · strip AI comments/TODOs/dead code ·
`.env` gitignored · tagged release.

**UI hard specs to hardcode as tokens (§07):** 4/8px spacing · type scale 12/14/16/20/24/32/48 (body
16, lh 1.5, headings 1.2) · radius 8 default /6 inputs /12 cards /9999 pills · tap target ≥44px · AA
contrast 4.5:1 body, 3:1 large/UI · app shell ≤1280px, prose ≤680px · motion 150–250ms ease
`cubic-bezier(0.4,0,0.2,1)`, 300ms cap, honor reduced-motion · Inter + mono for numbers · focus ring
2px accent +2px offset on `:focus-visible` · breakpoints 640/768/1024/1280 mobile-first.

**Open decision to raise with user:** commit-trailer AI attribution vs. brief's "own every line" — ask
before finalizing git history.

**Resolved:** user chose no AI co-author trailer (see §9 handoff record). All commits are authored
solely under the user's git identity, conventional-commit style, atomic per logical unit.

---

## 8. Session handoff to Antigravity + post-handoff audit (this session)

Work was hand-milestoned M0→M2 by Claude Code, then handed to **Google Antigravity** (via
`docs/HANDOFF_ANTIGRAVITY.md`) to continue M3→M6. Antigravity delivered all four milestones in one
extended session (25 commits: `c5331ef`…`12933d4`). A follow-up Claude Code session then **audited
that work end-to-end** — not by reading code, but by actually running the app (Playwright against a
live dev server, real login, real clicks) — before continuing to M7. Findings below.

### Verdict: M3–M6 substantially correct and functional

Confirmed working end-to-end against real seeded data (not just "renders"):

- Login/session/RBAC — proper `authjs.session-token` cookie, JWT claims, org-scoped access.
- Dashboard — 4 KPI cards + 3 charts (volume line, status donut, priority bars) + agent leaderboard,
  all computed from real aggregated ticket data.
- Tickets — list, **debounced server-side search** (URL-driven `?q=`), **column-header sort**
  (`?sort=status.asc`, verified order actually changes), **status/priority filter** via native
  `<select>` (`?status=OPEN`, verified 18/18 returned rows genuinely `OPEN`), **pagination**
  (`?page=2`, verified genuinely different rows), detail view with timeline, comment posting.
- CSV export — real file download (`tickets_export.csv`), respects active filters.
- PDF export — real per-ticket PDF download (`ticket-1062.pdf`).
- Contacts — list, create (redirects to detail + success toast; confirmed via server log + toast,
  not just UI inspection).
- Dark mode — **properly designed**, not inverted: elevated surfaces, desaturated accent, persists
  via `next-themes`, zero flash.
- Mobile responsive — no horizontal scroll at 375px; working slide-in sidebar drawer with backdrop.
- Auth pages — register, forgot-password render and are reachable.

### Bugs found during the audit and fixed

1. **P0 — entire authenticated app crashed on every load.** `src/components/app-shell/topbar.tsx`
   is a Server Component that inlined a `<Button onClick={...}>` (dispatching a synthetic
   Cmd/Ctrl+K keydown to open the command palette). Passing an event handler from a Server
   Component throws `Error: Event handlers cannot be passed to Client Component props.` — this
   fired on literally every page load post-login. **Fix:** extracted the button into
   `src/components/app-shell/search-trigger.tsx` (`"use client"`), matching the codebase's existing
   pattern of small client islands (`SignOutButton`, `ThemeToggle`). `Topbar` stays a Server
   Component. Verified via Next's own dev error overlay before/after.
2. **P1 — command palette crashed the instant you typed.** `src/components/ui/command.tsx`'s
   `CommandDialog` (shadcn-generated) wrapped children in `Dialog`/`DialogContent` but never
   rendered the `<Command>` (cmdk `CommandPrimitive`) root, so `CommandInput`/`CommandList` had no
   context/store to read — `TypeError: Cannot read properties of undefined (reading 'subscribe')`
   on the first keystroke. **Fix:** wrapped `children` in `<Command shouldFilter={false}>` inside
   `CommandDialog` (`shouldFilter={false}` because `CommandPalette` already does server-side
   search via `performGlobalSearch`, so cmdk's own client fuzzy-filter must not double-filter).
   Verified: typing "ticket" now returns real, live, grouped, zero-error results.
3. **Infra — M1's own test/format tooling had silently gone missing** (root-caused to *this
   project's own earlier Claude Code session*, not Antigravity): `vitest`, `@playwright/test`,
   `@testing-library/*`, `jsdom`, `prettier`, `prettier-plugin-tailwindcss`, `tsx`, `dotenv` were
   present in an `npm install` I ran during M1, but never made it into the committed
   `package.json`/`package-lock.json` — most likely clobbered by a subsequent `shadcn init`
   invocation regenerating the manifest. Net effect: on a **fresh clone**, `npm test`,
   `npm run test:e2e`, and `npm run format` would all fail with "command not found," and
   `db:seed` only "worked" via `npx`'s ad-hoc temp-install fallback. **Fix:** reinstalled all
   fourteen packages explicitly, pinning `@vitejs/plugin-react` to the `^4` line (the `latest`/v6
   resolves to a Babel-8-based chain that conflicts with shadcn's Babel-7 chain — real,
   reproducible `npm error ERESOLVE`). Removed the now-unneeded `@types/bcryptjs` stub (bcryptjs
   ships its own types). Typecheck/lint/build reverified green after.
4. **Cleanup — stale/leftover `any` usage in dashboard charts.** `priority-chart.tsx` and
   `status-distribution.tsx` had a file-level `/* eslint-disable @typescript-eslint/no-explicit-any */`
   plus several redundant per-line disables and `as any` casts around Recharts' `Tooltip`/`Legend`/
   `XAxis` formatter callbacks — almost certainly left over from an earlier draft before the "fix:
   resolve strict typing issues in Recharts" commit, since ESLint reported them as *unused*
   directives (i.e., nothing underneath them actually needed the exemption anymore). Replaced with
   properly typed callbacks using Recharts' own exported `ValueType`/`NameType` types — zero `any`,
   zero disables, matching the project's hard rule.

### False alarms during the audit (not app bugs — recorded so they aren't rediscovered)

- An early hand-rolled Playwright test used an **unanchored** `waitForURL(/dashboard/)` regex,
  which matches `/login?callbackUrl=%2Fdashboard` too (the substring "dashboard" appears in the
  query string) — produced false "login failed" readings.
- `src/lib/rate-limit.ts`'s `clientIp()` falls back to the literal string `"unknown"` when no
  `x-forwarded-for`/`x-real-ip` header is present — true for **all** local Playwright/curl traffic.
  Repeated local test runs against one long-lived dev server collapsed into a single shared
  `login:unknown:demo@deskly.app` bucket and legitimately tripped the 5-attempts/15-min limit,
  which looked identical to a broken login until traced. **Not fixed yet** — noted as a real,
  if minor, hardening item for M7 (see below); it isn't a functional bug for the seeded demo flow,
  but on any deployment that doesn't guarantee a trusted reverse proxy sets `x-forwarded-for`
  (or where a client can forge it), it's a soft spot worth a defense-in-depth pass.
  On Vercel specifically this resolves correctly (`x-forwarded-for` is platform-set and trustworthy).
- On Windows/Git Bash, `kill $pid` / `pkill -f "next dev"` against a process started with
  `npm run dev &` **did not** reliably terminate the real underlying `node.exe` — it kept serving
  on port 3000 under its original PID with all in-memory state (including the rate limiter) intact,
  making a "fresh restart" look identical to the stale process. Use `netstat -ano | grep :3000` to
  find the real PID and `taskkill //F //PID <pid>` to actually kill it on this platform.
- Contact creation appeared to "hang" on `/contacts/new` — it doesn't; `router.push` to the new
  contact's detail page plus the `sonner` success toast both fire correctly, a screenshot taken
  ~800ms after submit just caught the transition mid-flight (Next's own "Rendering…" dev indicator
  was visible in the capture).
- "Sort" and "filter" controls appeared absent to a first pass of Playwright selectors expecting
  shadcn `Select`/button components — they're implemented instead as semantic `<Link>` elements
  (sort headers) and native `<select>` (status/priority filters), which is a legitimate,
  progressively-enhanced, fully-accessible choice, not a gap. Verified functionally correct once
  selectors were corrected.

### Follow-ups carried into M7+

- [ ] Harden `clientIp()` in `src/lib/rate-limit.ts` — document/accept the "unknown" shared-bucket
      behavior for environments without a trusted proxy, and/or note the header-spoofing caveat in
      `docs/architecture.md`'s security section.
- [ ] No automated tests exist yet for any of M3–M6 (expected — that's M8). This audit was a manual,
      one-time verification pass; it does not substitute for the Playwright/Vitest suite still to
      be written.
