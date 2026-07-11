# How to Submit — Your Step-by-Step Guide

Everything below this point needs **you** — your accounts, your voice, your social media. I
can't click through Vercel's signup or record your voice for you. Follow this top to bottom in
order; each step tells you exactly what to click and what to type. Check each box as you finish it.

**Where things stand right now:** the entire app is built, tested, and already pushed to
`https://github.com/Ankit742005/websapp`. Nothing below touches code — it's all deployment,
recording, and submitting.

---

## Step 1 — Confirm the GitHub upload actually worked

- [ ] Open **https://github.com/Ankit742005/websapp** in your browser.
- [ ] Confirm you see the file list (README.md, src/, docs/, etc.) — not a 404.
- [ ] Click the **"commits"** link near the top — you should see 70+ commits.
- [ ] Click the **"tags"** dropdown (next to the branch selector) — you should see `v1.0.0`.

If all three check out, the upload is confirmed. ✅

---

## Step 2 — Deploy to Vercel (get your live URL)

### 2a. Create a Vercel account (skip if you already have one)

- [ ] Go to **https://vercel.com/signup**
- [ ] Click **"Continue with GitHub"** and sign in with the GitHub account that owns
      `Ankit742005/websapp`.

### 2b. Import the project

- [ ] Go to **https://vercel.com/new**
- [ ] Find `websapp` in the list of repositories and click **"Import"**.
- [ ] Vercel will auto-detect **Next.js** — leave the Framework Preset as-is. Don't click Deploy yet.

### 2c. Create a database (Turso)

Vercel doesn't keep files between deploys, so the app needs a real hosted database — Turso is
free and needs no credit card.

- [ ] Go to **https://turso.tech** and sign up (GitHub sign-in works here too).
- [ ] Once in the dashboard, click **"Create Database"**.
- [ ] Name it `deskly` (or anything), pick the region closest to you, click **Create**.
- [ ] On the database's page, find the **connection URL** — it looks like
      `libsql://deskly-yourname.turso.io`. Copy it.
- [ ] Find the button to **create a token** (sometimes called "Create Token" or under an "Auth
      Tokens" tab). Click it, copy the long token string it gives you. You won't be able to see
      it again after leaving the page, so paste it somewhere safe for a moment (a Notes app is
      fine — you'll delete it from there once it's in Vercel).

### 2d. Add environment variables in Vercel

Back on the Vercel import screen (or in **Project → Settings → Environment Variables** if you
already clicked Deploy), add these one at a time. For each: type the **Key**, paste the
**Value**, leave it checked for all environments, click **Add**.

| Key | Value |
| --- | --- |
| `DATABASE_URL` | The `libsql://...` URL you copied from Turso |
| `DATABASE_AUTH_TOKEN` | The token you copied from Turso |
| `AUTH_SECRET` | A new random secret — see below for how to generate one |
| `AUTH_URL` | Leave blank for now; you'll fill this in after the first deploy (Step 2f) |
| `NEXT_PUBLIC_APP_URL` | Same as `AUTH_URL` — leave blank for now, fill in Step 2f |

**To generate `AUTH_SECRET`:** on your own computer, open a terminal in the project folder and run:

```bash
npx auth secret
```

It prints a random string — copy just that string (not the whole command output) into the
`AUTH_SECRET` value in Vercel.

### 2e. Deploy

- [ ] Click the big **Deploy** button.
- [ ] Wait for the build to finish (2–4 minutes). Vercel shows live build logs — if it fails, the
      error is almost always a missing/misspelled environment variable; double-check Step 2d.
- [ ] When it succeeds, Vercel shows you a URL like `https://websapp-xyz123.vercel.app` — click
      **"Visit"**. You'll see the app, but **sign-in won't work yet** — one more step.

### 2f. Fill in the two URL variables you skipped

- [ ] Copy your actual Vercel URL from the address bar (e.g. `https://websapp-xyz123.vercel.app`).
- [ ] Go to **Project → Settings → Environment Variables** in Vercel.
- [ ] Edit `AUTH_URL` and `NEXT_PUBLIC_APP_URL` — paste your real Vercel URL into both.
- [ ] Go to the **Deployments** tab, click the **"⋯"** menu on the latest deployment, and click
      **"Redeploy"** so the app picks up the new values.

### 2g. Apply the database migrations

The database Turso just created is empty — it needs the app's tables. Run this **once**, from
your own computer, in the project folder:

```bash
# Windows PowerShell — replace the two values with your real Turso URL and token
$env:DATABASE_URL="libsql://deskly-yourname.turso.io"
$env:DATABASE_AUTH_TOKEN="your-turso-token"
npm run db:deploy:turso
npm run db:seed
```

**Use `db:deploy:turso`, not `db:deploy`.** Prisma's own migration command can't connect to a
remote Turso URL at all (a real limitation of Prisma's engine, not a mistake you can make) —
`db:deploy:turso` is a small script in this repo that applies the same migrations a different,
working way. `db:deploy:turso` creates all the tables; `db:seed` adds the demo accounts
(`demo@deskly.app`, `owner@deskly.app`, `viewer@deskly.app`, all with password `demo1234`) so
reviewers can log in immediately without registering.

- [ ] Both commands finished without a red error.

### 2h. Verify it actually works

- [ ] Open your live Vercel URL in an **incognito/private window** (this proves it works for a
      stranger, not just because your browser has old cookies).
- [ ] Sign in with `demo@deskly.app` / `demo1234`.
- [ ] Click around — Tickets, Dashboard, Settings. Confirm no blank screens or errors.
- [ ] Open the browser's DevTools (F12) → Console tab → confirm no red errors.

**If all of that works, you're deployed.** ✅

---

## Step 3 — Put the live URL everywhere it belongs

Send me your live Vercel URL and I'll update these two files for you (or do it yourself — it's
one line in each):

- [ ] `README.md` — the "**Live demo →**" line near the top
- [ ] `SUBMISSION/README.md` — the "**Live deployment**" row in the Links table

Then commit and push:

```bash
git add README.md SUBMISSION/README.md
git commit -m "docs: add live deployment URL"
git push
```

---

## Step 4 — Polish the GitHub repo page (5 minutes)

- [ ] On **https://github.com/Ankit742005/websapp**, click the **gear icon** next to "About" (top
      right of the file list).
- [ ] **Description:** paste this —
      `A fast, keyboard-first helpdesk for lean support teams — real analytics, role-based access, and a ticket queue that never feels like it's fighting you.`
- [ ] **Website:** paste your live Vercel URL.
- [ ] **Topics:** add these one at a time — `nextjs`, `typescript`, `prisma`, `helpdesk`, `saas`,
      `react`, `tailwindcss`, `vercel`
- [ ] Click **Save changes**.
- [ ] On your GitHub **profile page**, click **"Customize your pins"** and pin this repo, so it's
      the first thing anyone sees when they visit your profile.

---

## Step 5 — Record the demo video (60–90 seconds)

### What to use

- [ ] Install **[Loom](https://www.loom.com/)** (free browser extension) — it records your screen
      and gives you a shareable link automatically. Or use anything you're comfortable with
      (OBS, QuickTime, your phone pointed at the screen — as long as you get a link or an mp4).

### Before you hit record

- [ ] Run `npm run db:seed` locally (or use your live Vercel URL) so the data looks intentional.
- [ ] Close DevTools, bookmarks bar, and any other browser tabs/notifications.
- [ ] Set your browser zoom to 100%.
- [ ] Read through the script below once so it feels natural, not like you're reading.

### The script — read this out loud while you click

This is written to be **spoken**, not read verbatim off a table. Practice it once or twice —
it should take about 75–85 seconds at a normal, unhurried pace.

> **[Landing page — `/`]**
> "Hey — this is Deskly, a helpdesk app I built for small support teams. Let me show you around."
>
> **[Click "Try the demo" or go to `/login`, sign in with `demo@deskly.app` / `demo1234`]**
> "First, I'll log in. This is real authentication — hashed passwords, real sessions — and this
> dashboard isn't fake data. Every number here — the resolution rate, this volume chart — is
> computed live from the tickets sitting in the database."
>
> **[Click "Tickets" in the sidebar]**
> "Let's look at tickets. Search, these filters, sorting — all of this happens on the server, not
> in the browser. And watch the address bar—"
>
> **[Type something into the search box, pick a status filter]**
> "—every filter combination becomes its own shareable link."
>
> **[Click into any ticket]**
> "Here's a single ticket. I can change its status right here—"
>
> **[Open the status dropdown, pick a different status]**
> "—and that's logged automatically. Every ticket has its own timeline, and there's a full audit
> log for the whole workspace, too."
>
> **[Press Ctrl+K, or Cmd+K on Mac]**
> "There's a command palette — I can jump straight to any ticket or page without touching the
> mouse."
>
> **[Navigate to Settings → Members]**
> "Permissions are enforced on the server, not just hidden in the interface. If I were logged in
> as a Viewer, I genuinely couldn't reach this members page — the server blocks it, it's not just
> a hidden button."
>
> **[Toggle dark mode, then export the ticket list to CSV]**
> "There's a real dark mode — not just an inverted color filter — and I can export whatever I'm
> currently looking at straight to a spreadsheet."
>
> **[Back to landing page or just stop screen-sharing]**
> "It's fully open source, MIT licensed — the link's in the description. Thanks for watching."

### After recording

- [ ] Watch it back once — check your audio is audible and the screen is readable.
- [ ] Get the shareable link (Loom does this automatically) or upload the file somewhere you can
      link to (YouTube unlisted works too).
- [ ] Add the link to `SUBMISSION/README.md`'s "**Demo video**" row.

---

## Step 6 — Review your case study

- [ ] Open `docs/case-study.md` and read it through once — it's already written (problem,
      approach, result, what you learned), but it's written in first person as if you wrote it, so
      skim it and make sure it still sounds like you before submitting. Edit anything that doesn't.

---

## Step 7 — Submit to Digital Heroes

Per the trial brief: once everything above is live, you submit by **messaging Shreyansh Singh
on LinkedIn or Instagram** with your links. That's the actual submission — there's no form.

- [ ] Find Shreyansh Singh on LinkedIn (or Instagram) and send a message with:
  - Your live app URL
  - Your GitHub repo URL: `https://github.com/Ankit742005/websapp`
  - Your demo video link
  - (Optional but a nice touch) one line pointing to `docs/case-study.md` if you want them to
    read the fuller write-up

A message template you can adapt:

> Hi Shreyansh — I've completed the Full Stack Developer Trial. Here's my submission:
>
> **Live app:** [your Vercel URL]
> **GitHub:** https://github.com/Ankit742005/websapp
> **Demo video:** [your Loom link]
>
> It's Deskly — a multi-tenant helpdesk with role-based access enforced server-side, real
> analytics, an audit log, and full test coverage (69 unit/integration + 12 E2E tests). Full
> case study is in the repo at `docs/case-study.md`. Happy to walk through any part of it live.

---

## Final checklist (the brief's own submission checklist)

- [ ] Live URL loads fast with zero console errors
- [ ] Real auth (login) works on the **production** URL, not just localhost
- [ ] Core CRUD verified by hand on the live site — create a ticket, edit it, delete it
- [ ] Search / filter / sort / pagination behave correctly
- [ ] Every screen handles loading, empty, and error states
- [ ] Responsive on mobile; keyboard-navigable
- [ ] `.env` is not committed (it isn't — verified gitignored)
- [ ] README has screenshots, quick start, env table, and demo login ✅ (already done)
- [ ] LICENSE, CONTRIBUTING, CHANGELOG, `.env.example` all present ✅ (already done)
- [ ] Meta tags, OG image, sitemap, robots.txt all in place ✅ (already done)
- [ ] Demo video recorded and linked
- [ ] Case study reviewed
- [ ] Message sent to Shreyansh Singh

Once every box above is checked, you're done. Everything except the boxes in Step 2, 5, and 7
is already complete.
