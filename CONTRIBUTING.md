# Contributing to Deskly

Thanks for considering a contribution. This is a small, single-maintainer project — issues and
PRs are welcome, but please open an issue before starting on anything nontrivial so we don't
duplicate effort.

## Local setup

Follow the [Quick Start](README.md#quick-start) in the README. In short:

```bash
git clone https://github.com/Ankit742005/websapp.git
cd deskly
cp .env.example .env && npx auth secret   # paste the output into AUTH_SECRET
npm install
npm run db:migrate && npm run db:seed
npm run dev
```

## Branch naming

`type/short-description`, matching the commit prefixes below — e.g. `feat/saved-views`,
`fix/ticket-export-timezone`, `docs/api-reference`.

## Commit style

[Conventional Commits](https://www.conventionalcommits.org/): `type(scope): summary`, imperative
mood, present tense.

```
feat(tickets): add bulk status change from the list view
fix(auth): rotate the session on privilege change
docs(readme): correct the env var table
```

Common types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `style`, `perf`. Keep commits
small and focused — one logical change per commit. A reviewer (or future you) should be able to
understand *why* from the message without opening the diff.

## Before you open a PR

```bash
npm run typecheck   # strict TypeScript — zero errors, zero `any`
npm run lint          # ESLint
npm run test           # Vitest — unit + integration
npm run test:e2e         # Playwright — starts its own server, reseeds the DB
npm run build              # the real gate — `next dev` tolerates things `next build` won't
```

All five must pass locally before pushing; CI runs the same checks (`.github/workflows/ci.yml`)
and will block the PR if any fail.

## Pull requests

- One PR per logical change — a "and also" PR is harder to review and harder to revert.
- Describe **what** changed and **why** in the PR body; the diff already shows what changed
  line-by-line, so use the description for context a diff can't carry.
- Rebase on `main` before opening, so the PR applies cleanly.
- Link the issue it closes, if there is one (`Closes #12`).

## Code style

- TypeScript strict mode, no `any` — ESLint enforces this (`@typescript-eslint/no-explicit-any`
  is an error, not a warning).
- Every server action follows the existing pattern: resolve the tenant, check `can()`, validate
  with Zod, mutate scoped by `orgId`, write an audit-log entry, `revalidatePath`, return
  `ActionResult`. See `docs/API.md` for the full contract and `docs/architecture.md` for why.
- Comment the *why*, not the *what* — a well-named function rarely needs a comment explaining
  what it does.
- Prettier formats on save in most editors; `npm run format` runs it manually if needed.
