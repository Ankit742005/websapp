# decisions.md

A short list of the decisions that weren't obvious, and the trade-off accepted in each case.

## SQLite (via a driver adapter) instead of Postgres-only

**Decision:** commit `provider = "sqlite"`, connect through `@prisma/adapter-libsql` locally
(a plain file) and in production (Turso, same protocol).

**Why:** a reviewer's first `npm install && npm run dev` should never depend on Docker or a
managed Postgres instance existing. The driver-adapter architecture in Prisma 7 means the
*only* thing that changes between "local file" and "hosted Turso" is a connection string — the
schema, the client construction, and every query are identical in both environments, so local
dev is a faithful preview of production rather than a different database engine entirely.

**Trade-off accepted:** SQLite has no native enum type and weaker concurrent-write
characteristics than Postgres under heavy write load. The enum gap is solved with string-union
types + Zod (see below) rather than worked around. The concurrency ceiling is a real one — for
a genuinely high-write-volume deployment, `docs/deployment.md`'s Postgres section is the
documented alternative, and the schema was kept portable specifically so that swap doesn't
require a rewrite.

## Enums as string unions, not Prisma's native enum type

**Decision:** `Role`, `TicketStatus`, `TicketPriority`, `AuditAction` are `as const` tuples in
`src/lib/constants/enums.ts`, stored as plain `String` columns, validated by a matching Zod
schema at every form, action, and API boundary.

**Why:** a direct consequence of the SQLite decision above (no native enum support), but it
turned out to be the right call independent of that — one file is the source of truth for a
value set that the UI, the validation layer, and the database all need to agree on, instead of
three places that can drift.

## Offset pagination, not keyset/cursor

**Decision:** the ticket list paginates with `skip`/`take` (`?page=2` in the URL), not a cursor.

**Why accepted, not fixed:** offset pagination is the simpler implementation and it's genuinely
fine at this app's actual scale (the seed data is 64 tickets; a real small-team helpdesk might
run into the low thousands). The brief itself frames the trade-off correctly — offset degrades
past roughly 10k rows, because the database has to walk and discard every skipped row. That's a
real, known limitation of the current implementation, not an oversight: if this were going into
production for a team large enough to hit that ceiling, `getTickets()` in
`src/lib/dal/tickets.ts` is the one function that would need to move to a `(sortKey, id)` cursor.

## Removing a member detaches, it doesn't delete

**Decision:** `removeMemberAction` sets `User.orgId = null` rather than deleting the row.

**Why:** `Comment.author` has `onDelete: Cascade` in the schema — a hard delete of a user who
had ever commented on a ticket would silently erase that history along with them. Detaching
ends their access immediately (the tenancy boundary is `orgId`-based, so a null `orgId` means
`requireOrg()` bounces them to `/onboarding` on their next request) while every ticket
assignment, comment, and audit-log entry they're referenced in stays exactly as it was.

## Rate limiting: in-memory, with a documented (not silently ignored) gap

**Decision:** `src/lib/rate-limit.ts` is a plain `Map`-backed fixed-window limiter, keyed by
`x-forwarded-for` (or `x-real-ip`, or the literal string `"unknown"` if neither header is
present).

**Why accepted:** this is correct and sufficient for a single-instance deployment on a platform
that sets `x-forwarded-for` at a trusted edge and strips any client-supplied value — which is
exactly Vercel, the brief's recommended target. It is **not** sufficient in front of a proxy
that blindly forwards client-supplied headers (an attacker could rotate the header value to
evade the limit) or across multiple server instances (each would have its own bucket). Both
gaps are called out directly in the function's own doc comment rather than left to be
discovered later — the honest framing is "correct for the documented deployment target, with a
known and stated boundary," not "solved."

## Detach the marketing site from the authenticated app shell

**Decision:** a `(marketing)` route group with its own header/footer/layout, separate from the
`(app)` group's sidebar shell.

**Why:** the two surfaces have almost nothing in common — one is public, SEO-indexed, and
needs its own metadata/JSON-LD/breadcrumbs; the other requires a session and renders behind a
persistent nav. Sharing a layout between them would mean threading conditionals through a
single file instead of two files that are each simple on their own.
