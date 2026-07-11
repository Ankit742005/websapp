# deployment.md

## Local development

```bash
git clone https://github.com/Ankit742005/websapp.git
cd websapp
cp .env.example .env
npx auth secret            # paste the output into AUTH_SECRET in .env
npm install                 # postinstall runs `prisma generate` automatically
npm run db:migrate           # applies prisma/migrations to a local dev.db
npm run db:seed              # demo org, users, contacts, tickets, comments
npm run dev                   # http://localhost:3000
```

No Postgres, no Docker, no external services required — `DATABASE_URL="file:./dev.db"` is a
local SQLite file read through the libSQL driver adapter (`@prisma/adapter-libsql`).

## Deploying to Vercel

1. Push the repo to GitHub.
2. At [vercel.com/new](https://vercel.com/new), import the repository — Vercel auto-detects
   Next.js and needs no build-command changes.
3. Under **Project Settings → Environment Variables**, add every variable from
   [.env.example](../.env.example):
   - `DATABASE_URL`, `DATABASE_AUTH_TOKEN` — see the Turso section below
   - `AUTH_SECRET` — generate a **new** one for production (`npx auth secret`), don't reuse the
     local dev value
   - `AUTH_URL` — your production URL, e.g. `https://deskly.vercel.app`
   - `NEXT_PUBLIC_APP_URL` — same value as `AUTH_URL`; this is what powers canonical tags, the
     OG image, and the sitemap, so it must be the real public URL
   - Optionally `AUTH_GOOGLE_ID`/`AUTH_GOOGLE_SECRET`, `AUTH_GITHUB_ID`/`AUTH_GITHUB_SECRET`
4. Deploy. Every push to `main` redeploys; every PR gets its own preview URL with its own env.

### Database: Turso (recommended, matches local dev exactly)

Vercel's filesystem is ephemeral, so a plain SQLite file doesn't survive between deploys.
[Turso](https://turso.tech) is a hosted, SQLite-compatible database with the same libSQL wire
protocol the app already uses locally — the driver adapter code doesn't change, only the
connection string does.

```bash
turso db create deskly
turso db show deskly --url          # → DATABASE_URL
turso db tokens create deskly       # → DATABASE_AUTH_TOKEN
```

Set both in Vercel's environment variables, then run the migration against the production
database once (from your machine, with the production `DATABASE_URL`/`DATABASE_AUTH_TOKEN`
exported):

```bash
npm run db:deploy    # prisma migrate deploy — applies committed migrations, no prompts
npm run db:seed       # optional — only if you want the same demo data in production
```

### Database: Postgres (alternative)

If you'd rather run Postgres (Neon, Supabase, Vercel Postgres, RDS — any of them), the schema
was deliberately kept portable:

1. In `prisma/schema.prisma`, change `provider = "sqlite"` to `provider = "postgresql"`.
2. Swap the driver adapter in `src/lib/db.ts` and `prisma.config.ts` from `PrismaLibSql` to
   `@prisma/adapter-pg` (or drop the adapter entirely and let Prisma connect directly — driver
   adapters are optional for Postgres).
3. Set `DATABASE_URL` to a standard `postgresql://` connection string.
4. Re-run `npm run db:migrate` locally once to regenerate the migration history for Postgres,
   then `npm run db:deploy` against production.

No application code outside those two files references SQLite specifically — the enums are
string unions (not native `CREATE TYPE`) specifically so this swap doesn't require touching the
domain model.

## Before you call it deployed

- [ ] The live URL loads with **zero console errors** and no broken images
- [ ] Sign up (or the seeded demo login) works end to end on the deployed URL, not just localhost
- [ ] `npm run db:deploy` has run against the production database — migrations are applied
- [ ] No secret appears in the client bundle (only `NEXT_PUBLIC_*` variables legitimately can —
      check the Network tab on a fresh load)
- [ ] Pasting the URL into Slack/Twitter/LinkedIn renders the custom OG card, not a blank grey box
- [ ] `robots.txt` and `sitemap.xml` resolve at the production domain
