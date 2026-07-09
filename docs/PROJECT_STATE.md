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
| M1 | Scaffold (Next/TS/Tailwind/shadcn/Prisma/Auth) | ⏳ NEXT | `npm run build` passes; base layout + theme render |
| M2 | Data model & auth (schema, seed, RBAC) | ⬜ | Login works; seeded data; middleware protects routes |
| M3 | Core CRUD (tickets, comments, contacts) | ⬜ | Create/read/update/delete ticket end-to-end |
| M4 | Dashboard & analytics | ⬜ | KPIs + ≥3 charts render from real data |
| M5 | Data table (search/filter/sort/paginate/export) | ⬜ | URL-driven table; CSV + PDF download work |
| M6 | UX polish (⌘K, dark mode, states, a11y) | ⬜ | Command palette + all 5 UI states + keyboard nav |
| M7 | Settings, profile, members/RBAC, audit log | ⬜ | Role changes gated; audit log records mutations |
| M8 | Testing (Vitest + Playwright) | ⬜ | Unit+integration+E2E green in CI |
| M9 | Docs & deploy (README/SEO/CI/SUBMISSION) | ⬜ | All docs + SEO assets + CI + SUBMISSION/ present |
| M10 | Final QA + self-review ≥95/100 | ⬜ | Line-by-line audit complete; score ≥95 |

---

## 4. Current status

- **Active milestone:** M0 → M1
- **Last action:** wrote foundation docs (this file, MASTER_REQUIREMENTS, plan, research).
- **Next action:** scaffold Next.js app (`create-next-app` non-interactive), wire Tailwind + shadcn, Prisma init, Auth.js skeleton, base app shell + theme provider; verify `npm run build`.
- **Blocps / open questions:** real Digital Heroes brief not yet provided — building to the STEP 1–15 spec; will reconcile on receipt.

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
