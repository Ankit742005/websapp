# MASTER_REQUIREMENTS.md

> Extracted from the trial brief (STEP 1–15). Every requirement is a checkbox.
> Legend: `[ ]` todo · `[~]` in progress · `[x]` done. Each item maps to a milestone (Mx).
> **This is the contract the final QA (M10) audits against, line by line.**

---

## A. Project selection (STEP 2) — decision & justification

**Chosen: `Deskly`, a multi-tenant customer-support / helpdesk SaaS.**

**Why it maximises hiring signal** — it is the *only* single product that naturally exercises **every** evaluation axis without feeling contrived:

| Required capability | How Deskly demonstrates it naturally |
|---|---|
| Authentication | Email/password login, sessions, protected app |
| Authorization / RBAC | Owner vs Admin vs Agent — different powers, enforced server-side |
| CRUD | Tickets, comments, contacts, tags, saved views |
| Dashboards | Support ops dashboard (KPIs, trends, SLA) |
| Analytics | Volume over time, by status/priority, resolution rate, agent leaderboard |
| Search / filter / sort / paginate | The ticket table — the heart of any helpdesk |
| Exports (CSV + PDF) | Export filtered tickets to CSV; ticket + report to PDF |
| Database design | Org → Users/Contacts → Tickets → Comments/Tags/Audit (real relations) |
| Audit log & activity | Every mutation recorded; per-ticket timeline |
| Settings & profile | Org settings, member management, personal profile |
| Responsive + polish | Sidebar app-shell like Linear/Vercel; command palette |

**Explicitly avoided** (per brief): Todo, Weather, Chat clone, any beginner project.
**Not a clone:** helpdesk is a product *category*, executed with an original data model, UI and brand.

---

## B. Functional requirements (STEP 6)

- [ ] **Authentication** — credentials login, secure sessions, sign-out (M2)
- [ ] **Authorization** — server-side permission checks on every mutation (M2/M7)
- [ ] **RBAC** — Owner / Admin / Agent roles with distinct capabilities (M2/M7)
- [ ] **CRUD** — full create/read/update/delete for Tickets (+ comments, contacts, tags) (M3)
- [ ] **Dashboard** — KPI cards + charts landing page (M4)
- [ ] **Analytics** — ≥3 charts from real aggregated data (M4)
- [ ] **Search** — full-text-ish search across ticket subject/body/contact (M5)
- [ ] **Advanced filtering** — status, priority, assignee, tag, date range (M5)
- [ ] **Sorting** — by created/updated/priority/status (M5)
- [ ] **Pagination** — server-side, URL-driven, page-size control (M5)
- [ ] **Export CSV** — current filtered result set (M5)
- [ ] **Export PDF** — per-ticket PDF + dashboard/report PDF (M5)
- [ ] **Dark mode** — system/light/dark, persisted, no flash (M6)
- [ ] **Responsive UI** — mobile → desktop, collapsible sidebar (M6)
- [ ] **Loading states** — skeletons + spinners (M6)
- [ ] **Error states** — error boundaries + inline errors (M6)
- [ ] **Empty states** — meaningful zero-data screens with CTAs (M6)
- [ ] **Success states** — confirmations/toasts (M6)
- [ ] **Skeleton loaders** — table/cards/dashboard (M6)
- [ ] **Toast notifications** — success/error/info (M6)
- [ ] **Optimistic updates** — status change / assignment feel instant (M6)
- [ ] **Audit log** — actor, action, entity, before/after, timestamp (M7)
- [ ] **Profile page** — name, avatar, password change (M7)
- [ ] **Settings page** — org settings + members + preferences (M7)
- [ ] **Activity history** — per-ticket timeline of events (M3/M7)
- [ ] **Secure API** — authn+authz on every route handler (M2/M3)
- [ ] **Validation** — Zod on client (RHF) and server (M3)
- [ ] **Rate limiting** — on auth + write/export endpoints (M7)
- [ ] **Server-side validation** — never trust the client (M3)
- [ ] **Professional error handling** — typed results, no leaked internals (M3)

---

## C. UI / UX requirements (STEP 7)

- [ ] Quality bar ≈ Linear / Stripe Dashboard / Vercel Dashboard (all)
- [ ] Excellent, consistent spacing scale (M1/M6)
- [ ] Consistent typography scale (M1)
- [ ] Minimal, restrained color palette (M1)
- [ ] Professional cards, tables, charts (M4/M5)
- [ ] Smooth, tasteful animations (M6)
- [ ] Keyboard navigation (M6)
- [ ] Command palette (⌘K / Ctrl-K) (M6)
- [ ] Accessibility (WCAG AA: focus rings, labels, roles, contrast) (M6)
- [ ] Dark mode (M6)
- [ ] No ugly defaults / amateur layouts (all)

---

## D. Code-quality requirements (STEP 8)

- [ ] No AI spaghetti / no duplicated logic (all)
- [ ] Proper architecture — feature folders, layered (all)
- [ ] Reusable components / hooks / utilities (all)
- [ ] Clean naming (all)
- [ ] Comments only where they add value (all)
- [ ] TypeScript **strict**, **zero `any`** (M1 config + all)
- [ ] ESLint + Prettier clean (M1)

---

## E. Testing requirements (STEP 9)

- [ ] Unit tests (Vitest) — utils, permissions, validators (M8)
- [ ] Integration tests — server actions / API + DAL (M8)
- [ ] E2E tests (Playwright) — login → create ticket → filter → export (M8)
- [ ] Critical flows covered (M8)

---

## F. Documentation requirements (STEP 10)

- [ ] `README.md` (M9)
- [ ] `docs/architecture.md` (M9)
- [ ] `docs/API.md` (M9)
- [ ] `CHANGELOG.md` (M9)
- [ ] `CONTRIBUTING.md` (M9)
- [ ] `LICENSE` (MIT) (M9)
- [ ] ER diagram (in plan.md + architecture.md, Mermaid) (M0/M9)
- [ ] Folder-structure explanation (M9)
- [ ] Environment variables doc (`.env.example` + README) (M1/M9)
- [ ] Deployment guide (`docs/deployment.md`) (M9)
- [ ] Testing guide (`docs/testing.md`) (M9)
- [ ] Screenshots folder (`docs/screenshots/`) (M9)
- [ ] Decision log (`docs/decisions.md` + PROJECT_STATE §2) (M0/M9)

---

## G. Deployment requirements (STEP 11)

- [ ] Deploy-ready config (Vercel) (M9)
- [ ] Environment variables documented & templated (M1/M9)
- [ ] Production build passes (`npm run build`) (M1+)
- [ ] SEO metadata (title/description/canonical) (M9)
- [ ] Open Graph + Twitter cards (M9)
- [ ] `robots.txt` (M9)
- [ ] `sitemap.xml` (M9)
- [ ] Web app manifest (M9)
- [ ] Favicon set (M9)
- [ ] Performance optimization (RSC, code-split, caching) (all)
- [ ] Image optimization (`next/image`) (M9)

---

## H. GitHub / repository requirements (STEP 12)

- [ ] Professional repo (README badges, description) (M9)
- [ ] Meaningful, atomic commits (all — conventional commits)
- [ ] Issue templates (bug + feature) (M9)
- [ ] Pull-request template (M9)
- [ ] GitHub Actions CI (lint + typecheck + test + build) (M9)
- [ ] Topics + description (documented for user to set) (M9)
- [ ] MIT License (M9)

---

## I. SEO requirements (STEP 11, expanded)

- [ ] Per-route metadata via Next Metadata API (M9)
- [ ] Semantic HTML + landmarks (M6/M9)
- [ ] `sitemap.ts` + `robots.ts` (M9)
- [ ] OG image (static or dynamic) (M9)
- [ ] Lighthouse-friendly (perf/a11y/best-practices/SEO) (M9)

---

## J. Evaluation criteria (STEP 15 — how we will be scored)

We will self-score (M10) and must reach **≥95/100** across:
UI · Architecture · Code Quality · Backend · Database · Security · Documentation · Deployment · GitHub · Overall.

---

## K. Bonus / "wow" requirements (going beyond)

- [ ] Command palette with actions + navigation (M6)
- [ ] Optimistic UI on status/assignment (M6)
- [ ] Multi-tenant data isolation (DAL-enforced) (M2)
- [ ] Audit log with before/after diff (M7)
- [ ] Saved filter views (M5)
- [ ] Keyboard shortcuts + a11y (M6)
- [ ] Dynamic OG image (M9)
- [ ] Seeded, realistic demo data (M2)
- [ ] Rate limiting (M7)

---

## L. Submission package (STEP 14) — `SUBMISSION/`

- [ ] README (submission-facing)
- [ ] Project summary
- [ ] Architecture summary
- [ ] Feature list
- [ ] Tech stack
- [ ] Screenshots
- [ ] Demo credentials
- [ ] Deployment URL placeholder
- [ ] GitHub URL placeholder
- [ ] Folder structure
- [ ] Known limitations
- [ ] Future improvements
- [ ] Time spent
- [ ] Lessons learned

---

## M. Submission checklist (STEP 13 — final gate)

- [ ] Every box in A–L checked or explicitly deferred with reason
- [ ] `npm run build` + `npm test` + `npm run e2e` green
- [ ] `npm run lint` + `npm run typecheck` clean (0 errors, 0 `any`)
- [ ] Deploy guide verified against a clean checkout
- [ ] Self-review score ≥ 95/100 recorded in `docs/self-review.md`
- [ ] PROJECT_STATE.md reflects final state
