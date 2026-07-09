# docs/research.md — Competitor & Pattern Research

> STEP 3. Study category leaders, extract **patterns** (not branding), translate each into a
> concrete design decision for Deskly. We copy *craft*, never trade dress.

---

## Products studied

| Product | Why relevant | What we extract |
|---|---|---|
| **Linear** | Gold standard for B2B app-shell + keyboard UX | Sidebar IA, ⌘K palette, inline editing, density, motion restraint |
| **Stripe Dashboard** | Best-in-class data + analytics presentation | KPI header, chart hierarchy, table affordances, empty states |
| **Vercel Dashboard** | Clean minimal surfaces, great forms/settings | Settings layout, form patterns, toasts, dark mode |
| **Intercom / Zendesk** | Domain leaders in helpdesk | Ticket triage model, statuses, macros, assignment, SLA framing |
| **Notion** | Content density + command menu | Slash/command menu ergonomics, empty-state coaching |

---

## 1. Navigation & information architecture

**Observed (Linear/Vercel):** persistent left sidebar with a compact workspace switcher at top,
primary nav grouped by concept, secondary items (saved views) nested, user menu bottom-left.
Content area has a slim top bar with breadcrumbs + page actions on the right. No mega-menus.

**Deskly decision:** Left sidebar → `Dashboard · Tickets · Contacts · Analytics · Settings`,
with **Saved Views** nested under Tickets. Org switcher top, user menu bottom. Top bar carries
page title + primary action (e.g. "New ticket") + ⌘K hint.

## 2. Dashboard layout

**Observed (Stripe):** a row of KPI tiles (big number, label, delta vs previous period) above a
primary time-series chart, then a grid of smaller breakdowns. Generous whitespace, one accent color.

**Deskly decision:** 4 KPI tiles (Open, Resolved 7d, Avg first response, Resolution rate) → a
volume line chart (14/30d) → a 2-col grid: status donut + priority bars → agent leaderboard table.

## 3. Sidebar

**Observed:** ~240px, subtle hover, active item has a soft background + left accent, icons + labels,
collapsible to icons on narrow viewports. Keyboard focusable.

**Deskly decision:** exactly this; collapses to a sheet on mobile; active state via `aria-current`.

## 4. Tables (the core surface)

**Observed (Linear/Stripe):** dense rows (~44px), quiet zebra-free separators, sticky header,
right-aligned numerics, status as a **pill/badge**, priority as an icon, row hover reveals actions,
column header click to sort, URL-encoded filters, bulk-select checkboxes, sticky pagination footer.

**Deskly decision:** a reusable `<DataTable>` — server-side sort/filter/paginate driven by URL
params; status badge + priority icon; row → detail; column sort; page-size selector; CSV/PDF export
in the toolbar; selectable rows for bulk status change.

## 5. Forms

**Observed (Vercel):** single-column, label above field, inline validation on blur, helper text,
destructive actions isolated in a red "danger zone", primary button right-aligned, disabled while
submitting with a spinner. Sensible autofocus.

**Deskly decision:** React Hook Form + Zod resolver; inline field errors; submit disabled + spinner;
danger zone for delete; sheet/modal for quick-create, full page for complex edit.

## 6. Empty states

**Observed (Stripe/Notion):** icon + one-line headline + short subtext + a primary CTA, sometimes a
"learn more" link. Never a blank screen. Distinct from loading and from filtered-to-zero.

**Deskly decision:** three separate states — first-run empty (CTA to create), filtered-empty
("no tickets match — clear filters"), and error (retry). Skeletons for loading.

## 7. Search & command palette

**Observed (Linear):** ⌘K opens a palette that mixes **navigation**, **actions** (create, change
status), and **search results**, grouped with headers, fully keyboard-driven, fuzzy matched, ESC to close.

**Deskly decision:** ⌘K/Ctrl-K palette (cmdk) with groups: *Navigate*, *Actions* (New ticket, Toggle
theme), *Recent tickets*. Debounced ticket search. Full keyboard loop + focus trap.

## 8. Motion & feedback

**Observed:** motion is *functional* — 120–200ms ease, subtle; toasts bottom-right auto-dismiss;
optimistic updates so the UI never feels like it's waiting on the network.

**Deskly decision:** Tailwind + Radix transitions ≤200ms; `sonner` toasts; optimistic status/assignee
changes with rollback on failure.

## 9. Density, type & color

**Observed:** a single neutral gray scale + one brand accent + semantic colors (green/amber/red) used
sparingly for status; tight type scale (12/13/14/16/20/24), medium weight for headings.

**Deskly decision:** neutral zinc scale + one indigo accent + semantic status colors; Tailwind type
scale; `font-medium` headings; 4px spacing grid.

## 10. Accessibility & keyboard

**Observed:** visible focus rings, ESC/Arrow support in menus, labelled controls, adequate contrast,
respects `prefers-reduced-motion` and `prefers-color-scheme`.

**Deskly decision:** Radix primitives (a11y built in), visible focus, `prefers-reduced-motion`
guards, AA contrast in both themes, semantic landmarks.

---

## Anti-patterns we deliberately avoid

- Rainbow palettes / gradients-everywhere.
- Modal-on-modal flows.
- Client-side-only filtering that breaks on large data.
- Spinners with no layout (use skeletons that match final layout).
- Toasts for everything (reserve for outcomes, not navigation).
- Copying any competitor's exact colors, logo, copy, or iconography.

---

## Net translation → build backlog

Every decision above is captured as a component or milestone in `plan.md` and `MASTER_REQUIREMENTS.md`.
The through-line: **Linear's app-shell + keyboard craft, Stripe's data presentation, Vercel's settings/forms** — executed with an original helpdesk data model and brand.
