# HANDOFF — Read this first

> Written by a prior Claude Code session so a fresh Antigravity session can continue
> **Deskly** without losing quality, context, or discovered gotchas. Read this file
> completely before writing any code. Then read `docs/PROJECT_STATE.md`,
> `docs/MASTER_REQUIREMENTS.md`, and `docs/plan.md` in that order.

## 0. What this project is

**Deskly** — a multi-tenant customer-support/helpdesk SaaS — built for the **Digital
Heroes Full Stack Developer Trial** ("The Builder's Handbook" by Prasun Anand). The
full brief text is reproduced in `docs/PROJECT_STATE.md §7` and `docs/MASTER_REQUIREMENTS.md`
(it was read in full from the original PDF; there is no need to ask the user for it
again). The task: design, build, ship, and open-source one real full-stack product to
a **top-1%-candidate** bar. Evaluation is weighted — see §5 below — and the target is
**≥95/100** on the self-review rubric in `docs/PROJECT_STATE.md §7`.

**Repo:** `https://github.com/soulrahulrk/deskly` (public, pushed, `main` branch, clean).
**Local path:** `C:\Users\rahul\Documents\code\python\ankit\New folder\deskly`

## 1. Status right now (verified, not aspirational)

| Milestone | State | Proof |
|---|---|---|
| M0 Planning docs | ✅ done | `docs/{PROJECT_STATE,MASTER_REQUIREMENTS,plan,research}.md` |
| M1 Scaffold (Next 16, Tailwind v4, shadcn/ui, design tokens, providers, security headers) | ✅ done | `npm run build` green |
| M2 Data + Auth (Prisma 7 schema/migration/seed, Auth.js v5, RBAC, proxy gate, rate limiting) | ✅ done | `npm run typecheck` + `npm run build` green; `npm run db:seed` produced 6 users/14 contacts/64 tickets/99 comments/87 audit rows |
| M3 App shell + auth pages + ticket/contact CRUD | 🔜 **next** | not started |
| M4 Dashboard & analytics (Recharts) | ⬜ pending | |
| M5 Data table: search/filter/sort/keyset-paginate/CSV+PDF export/bulk actions | ⬜ pending | |
| M6 UX polish: ⌘K palette, dark mode, 4 states everywhere, toasts, optimistic updates, a11y, responsive, 404 | ⬜ pending | |
| M7 Settings/profile/members RBAC admin/audit log UI | ⬜ pending | |
| M8 Testing: Vitest + Playwright | ⬜ pending | |
| M9 Docs & deploy: README, architecture, API docs, CHANGELOG, CONTRIBUTING, LICENSE, SEO (OG/robots/sitemap/JSON-LD), landing+docs+FAQ pages, GitHub templates, CI, `SUBMISSION/`, case study | ⬜ pending | |
| M10 Final line-by-line audit + self-score ≥95/100 | ⬜ pending | |

Full detail, decision log (D1–D19), and evaluation-weight table: `docs/PROJECT_STATE.md`.
The **todo list state** as of handoff (recreate this with the TodoWrite-equivalent tool
if Antigravity has one):

```
[x] M0 — Foundation & planning docs + brief reconciliation
[x] M1 — Scaffold (build green, pushed to GitHub)
[x] M2 — Data & Auth (typecheck+build+seed all green)
[ ] M3 — App shell + auth pages + Core CRUD (tickets, comments, contacts)  <-- START HERE
[ ] M4 — Dashboard & analytics with Recharts
[ ] M5 — Data table: search, filter, sort, keyset pagination, CSV + PDF export, bulk actions
[ ] M6 — UX polish: command palette, dark mode, 4 states, toasts, optimistic updates, a11y, responsive, 404/error
[ ] M7 — Settings, profile, members/RBAC admin, audit log & activity history
[ ] M8 — Testing: Vitest unit/integration + Playwright E2E on critical flows
[ ] M9 — Docs & deploy (README, architecture, API, CHANGELOG, CONTRIBUTING, LICENSE, SEO, landing+docs+FAQ, GitHub templates, CI, SUBMISSION, case study)
[ ] M10 — Final QA line-by-line audit + reviewer self-scoring to ≥95/100
```

## 2. How to resume (exact commands)

```bash
cd "C:\Users\rahul\Documents\code\python\ankit\New folder\deskly"
npm install                 # postinstall runs `prisma generate` automatically
cp .env.example .env        # then generate a real secret:
npx auth secret              # paste the output into AUTH_SECRET in .env
npm run db:migrate           # applies prisma/migrations, or db:reset to start clean
npm run db:seed              # seeds demo org/users/tickets — safe to re-run (it clears first)
npm run dev                  # http://localhost:3000
```

Demo login (seeded): **`demo@deskly.app` / `demo1234`** (role ADMIN, org "Northwind
Support"). Also seeded: `owner@deskly.app`, `maya@deskly.app`, `leo@deskly.app`,
`sam@deskly.app`, `viewer@deskly.app` — all same password.

Verification gates to run before considering **any** milestone done:
```bash
npm run typecheck   # tsc --noEmit — must be zero errors, zero `any`
npm run lint         # eslint . — must be clean
npm run build        # next build — must succeed; this is the real gate, not `next dev`
```

## 3. Non-negotiable working style (from the brief, already validated by the user)

- **Milestones, not monoliths.** One vertical slice per turn (schema → actions →
  UI), each one fully working and verified before starting the next.
- **Spec/schema/types before feature code.** The Prisma schema and Zod schemas in
  `src/lib/validations/` are the contract; extend them first, then build on top.
- **Run the production build, not just `next dev`,** before calling anything done —
  `next dev` silently tolerates breakage that `next build` catches.
- **Update `docs/PROJECT_STATE.md`** at the end of every milestone (status table +
  decision log if a new non-obvious choice was made). This file is the project's
  persistent memory across sessions/tools — keep it current or the next handoff loses
  information.
- **Git: atomic, conventional commits, no AI attribution trailer.** The user
  explicitly chose "no Co-Authored-By: Claude" so the git log reads as authored
  work (the brief scores "own every line" and "reviewers read your git log").
  Commit per logical unit (e.g. `feat(tickets): server actions and Zod schema`,
  `feat(ui): ticket list page`), not one giant commit. Never squash the existing
  history. Push only when the user approves it (they've approved pushes so far
  in this session, but confirm before force-pushing or rewriting history — never
  rewrite history on `main`).
- **No placeholder/demo-level code.** Every feature must actually work end to end
  against the real seeded SQLite database — this was verified after every milestone
  so far and must continue.
- **Strict TypeScript, zero `any`.** Enforced by `tsconfig.json` (`strict` +
  `noUncheckedIndexedAccess` + more) and `eslint.config.mjs`
  (`@typescript-eslint/no-explicit-any: "error"`). Do not weaken either config to
  make errors go away — fix the actual type.

## 4. Stack actually installed (confirm versions before assuming APIs)

Next.js **16.2.10** (App Router, Turbopack by default) · React **19.2.4** ·
TypeScript **5** strict · Tailwind **v4** (CSS-based config, no `tailwind.config.js`)
· shadcn/ui (Radix base, Nova preset, re-themed — see `src/app/globals.css`) ·
Prisma **7.8.0** (driver-adapter architecture, **not** the Prisma 5/6 API you may
know) · `@prisma/adapter-libsql` + `@libsql/client` (SQLite locally via libSQL, Turso
in prod) · `next-auth` **v5 beta 31** (`@auth/prisma-adapter`) · Zod **4** ·
React Hook Form + `@hookform/resolvers` · TanStack Query v5 · Recharts **3** ·
`bcryptjs` · `lucide-react` · `sonner` · `cmdk` · `pdf-lib` · `next-themes` ·
`date-fns`. Dev/test: Vitest + Testing Library + Playwright + Prettier
(`prettier-plugin-tailwindcss`) + ESLint flat config.

**Full list is in `package.json` — trust the file over this summary if they diverge.**

## 5. Gotchas already discovered (do not re-discover these the hard way)

These cost real time in the prior session. They are true for the exact versions above.

1. **Next.js 16 breaking changes vs. training data.** `params`, `searchParams`,
   `cookies()`, `headers()` are **always async** — `await` them, no sync fallback.
   `middleware.ts` is renamed **`proxy.ts`** with an exported `proxy()` function
   (not `middleware()`); it only runs on the **Node runtime** now (no edge runtime
   option). `next lint` is removed — use `eslint .` directly (already wired in
   `package.json`). Parallel-route slots need a `default.tsx`. Before writing any
   App Router code, the full guide is vendored at
   `node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md` — read it
   if something doesn't behave as expected.

2. **Prisma 7 is architecturally different from Prisma 5/6.**
   - `datasource.url` is **banned inside `schema.prisma`** — Prisma 7 errors with
     P1012 if you put it there. The connection lives in `prisma.config.ts` instead
     (`datasource: { url }` for the CLI/migrate) and as a **driver adapter** passed
     to `new PrismaClient({ adapter })` for the runtime client. See
     `prisma.config.ts` and `src/lib/db.ts` — both already do this correctly; copy
     the pattern for anything new.
   - Prisma 7 needs a **`prisma.config.ts`** file; the CLI does not auto-load
     `.env`, hence the `import "dotenv/config"` at its top.
   - The generated client output is **not** the classic `node_modules/.prisma/client`
     — this project generates to `src/generated/prisma/` (see the `generator` block
     in `schema.prisma`) and imports as `@/generated/prisma/client`. It's gitignored
     — `postinstall: "prisma generate"` in `package.json` regenerates it after
     `npm install`, which is why CI/Vercel don't need it committed.
   - The `prisma` CLI package can silently fail to install as a sub-dependency of
     `@prisma/client` — if `npx prisma …` complains about missing `prisma/config`,
     run `npm install -D prisma@7.8.0` explicitly (already done; just noting why
     it's a pinned devDependency).
   - **`@prisma/adapter-libsql`'s actual runtime export is `PrismaLibSql`** (lowercase
     "ql"), **not** `PrismaLibSQL` as the docs/types elsewhere might suggest — a
     casing trap. Grep the codebase for `PrismaLibSql` to see the three correct
     usages (`src/lib/db.ts`, `prisma/seed.ts`) before adding a fourth.
   - Local `file:` DATABASE_URL and CLI-resolved paths can disagree on Windows
     unless normalized — `src/lib/db-url.ts` (`resolveLibsqlConnection`) is the
     shared helper that both `prisma.config.ts` and `src/lib/db.ts` use. Always go
     through it; don't construct libSQL configs inline.

3. **Auth.js v5 type augmentation.** The `JWT` interface must be augmented via
   `declare module "@auth/core/jwt"` — **not** `"next-auth/jwt"` as older docs say,
   or the augmentation silently doesn't apply and you get bizarre type errors far
   from the real problem. See `src/types/next-auth.d.ts`.

4. **`session.user.emailVerified` collides with the Prisma adapter's own
   `Date`-typed `emailVerified` field** on the underlying adapter user, producing an
   unsatisfiable `Date & string` intersection type. Fixed by exposing the app's own
   ISO-string claim under a **different field name, `session.user.verified`**
   (see `src/types/next-auth.d.ts`, `src/auth.ts`, `src/lib/auth/session.ts`). Don't
   try to reuse `emailVerified` on the session type.

5. **Zod 4 API differences from Zod 3:** use `z.email()` not `z.string().email()`;
   flatten errors with `z.flattenError(error)` (module function, not
   `error.flatten()`); prettify with `z.prettifyError(error)`. See
   `src/lib/validations/auth.ts` and `src/lib/validations/errors.ts` for the
   patterns already in use — follow them for new schemas.

6. **shadcn/ui CLI (current version) changed its flags.** `-b` now selects the
   component **base** (`radix` | `base`), not a color; color/theme comes from a
   **preset** (`-p <name>`, e.g. `nova`). Non-interactive init:
   `npx shadcn@latest init -y -t next -b radix -p nova`. The Nova preset ships pure
   neutral — this project **re-themed it** with a single indigo accent + semantic
   status colors in `src/app/globals.css` (brief requires "3 neutral grays, one
   accent"). When adding new shadcn components, they'll follow the existing
   `@theme inline` tokens automatically; don't hand-roll colors.

7. **npm package naming.** `create-next-app` refuses names with spaces, capitals,
   underscores, or leading underscores — that's why the app lives in a `deskly/`
   subdirectory of the parent folder rather than at the parent's own (invalid) name.

8. **Windows CRLF vs. the repo's enforced LF.** `.gitattributes` forces
   `* text=auto eol=lf`. If Windows tools reintroduce CRLF, run
   `git add --renormalize .` before committing rather than fighting individual
   files.

9. **Design tokens live in `src/app/globals.css`**, not a `tailwind.config.js`
   (Tailwind v4 is CSS-first). Brief's hard spec (8px radius base, 4/8px spacing,
   type scale, AA contrast, motion ≤300ms, `prefers-reduced-motion` handling) is
   already encoded there — extend it, don't create a parallel token system.

## 6. What M3 (the next milestone) needs to cover

Per `docs/plan.md §2` (user stories US-2 through US-7) and `docs/MASTER_REQUIREMENTS.md
§B`, M3 is the **core CRUD vertical slice**:

1. **App shell** for the authenticated area: `src/app/(app)/layout.tsx` with sidebar
   (Dashboard/Tickets/Contacts/Analytics/Settings per `docs/research.md §1`), topbar,
   user menu. Use `requireOrg()` from `src/lib/dal/context.ts` to gate it.
2. **Auth pages**: `/login`, `/register`, `/verify`, `/forgot-password`,
   `/reset-password` — the server actions already exist in `src/lib/auth/actions.ts`
   (`loginAction`, `registerAction`, `verifyEmailAction`,
   `resendVerificationAction`, `requestPasswordResetAction`,
   `resetPasswordAction`) and are fully typed/tested-by-typecheck; this milestone
   just needs the forms (React Hook Form + Zod resolver + shadcn `Form`) wired to
   them. Because there's no email provider configured, `registerAction` and
   `requestPasswordResetAction` return the verify/reset URL directly in
   `ActionResult.data` when `sendEmail` didn't deliver — surface that link in the UI
   (e.g., a dev-mode banner) so the flow is actually clickable end to end without
   real email.
3. **Ticket CRUD**: list page (basic table for now — the *rich* filter/sort/paginate/
   export table is M5), detail page (comments + timeline), create/edit forms,
   status/priority/assignee inline update. Server actions in a new
   `src/app/(app)/tickets/actions.ts`, Zod schemas in
   `src/lib/validations/ticket.ts`. Every mutation: `requireOrg()` → `can()` check
   from `src/lib/auth/permissions.ts` → Zod parse → Prisma write scoped by `orgId`
   → write an `AuditLog` row → `revalidatePath`. Return `ActionResult<T>`
   (`src/lib/action-result.ts`) — never throw across the server-action boundary.
4. **Contacts CRUD**: simpler version of the same pattern.
5. Ticket numbers are **per-org sequential** — use `Organization.ticketCounter`
   with an atomic increment (`prisma.organization.update({ data: { ticketCounter:
   { increment: 1 } } })` inside the same transaction as the ticket create) rather
   than counting rows.
6. Soft-delete tickets (`deletedAt`), never hard-delete — and every list query must
   filter `deletedAt: null` unless explicitly viewing trash.

Keep going through M4–M10 using `docs/MASTER_REQUIREMENTS.md` as the literal
checklist (it has a checkbox for every brief requirement, organized by section) and
`docs/plan.md` for the API/folder/ER-diagram contract. Do not skip SEO, testing, or
the `SUBMISSION/` package at the end — they're weighted 10%+18% combined in the
rubric and were not yet started as of this handoff.

## 7. Where the reconciliation with the *real* brief lives

The original assignment (a PDF, "Digital Heroes Full Stack Developer Trial — The
Builder's Handbook") was read in full mid-project. Its complete content — every
section, every hard spec, the full evaluation rubric — is captured in
`docs/PROJECT_STATE.md §7 "BRIEF RECONCILIATION"` and cross-referenced into
`docs/MASTER_REQUIREMENTS.md`. Treat those two files as authoritative over any
paraphrase here. The original PDF file itself was left in the **parent** directory
(one level up from this repo, `New folder/Digital_Heroes_Full_Stack_Developer_Trial.pdf`)
and is intentionally **not** part of the git repo.

## 8. One open item the user already decided

Commit messages: **no AI co-author trailer**, by explicit user choice (see §3). Don't
re-ask this — it's settled.
