# API.md

Deskly's mutations are **Next.js Server Actions** (progressive-enhancement-friendly, colocated
with the routes that use them); reads happen directly in Server Components via the data-access
layer (`src/lib/dal/`). A small number of things — the auth callback, and the two exports —
are conventional **Route Handlers** because they need to return a non-HTML response (a redirect
chain, a file download).

Every server action follows the same contract:

```
requireOrg() / requireUser()  →  can(role, action)  →  Zod.safeParse(input)
  →  org-scoped Prisma query  →  writeAuditLog()  →  revalidatePath()  →  ActionResult<T>
```

```ts
type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };
```

Actions never throw across the client/server boundary — every failure (validation, permission,
not-found) comes back as `{ ok: false, error }` so the UI always has something to render. This
also means there's no HTTP status code to inspect for actions; `ok` is the source of truth.

---

## Auth (`src/lib/auth/actions.ts`)

| Action | Auth required | Input | Output |
| --- | --- | --- | --- |
| `loginAction(raw, callbackUrl?)` | None | `{ email, password }` | Redirects on success (throws internally); `ActionResult<never>` on failure |
| `registerAction(raw)` | None | `{ name, orgName, email, password }` | `{ verifyUrl: string \| null }` — creates an Organization + OWNER user; `verifyUrl` is non-null only when no email provider is configured (dev mode) |
| `verifyEmailAction(raw)` | None | `{ token }` | `ActionResult` — marks `emailVerified` |
| `resendVerificationAction(rawEmail)` | None | `email: string` | `{ verifyUrl: string \| null }` |
| `requestPasswordResetAction(raw)` | None | `{ email }` | `{ resetUrl: string \| null }` — always returns success, never reveals whether the account exists |
| `resetPasswordAction(raw)` | None | `{ token, password }` | `ActionResult` — single-use token, 20-min TTL |

`loginAction` and `requestPasswordResetAction` are rate-limited (5 attempts / 15 min, keyed by
IP + email) via `src/lib/rate-limit.ts`.

## Tickets (`src/app/(app)/tickets/actions.ts`)

| Action | Auth required | Input | Output |
| --- | --- | --- | --- |
| `createTicketAction(raw)` | `ticket:create` | `{ subject, body, contactId, priority, assigneeId? }` | `{ id, number }` |
| `updateTicketAction(id, raw)` | `ticket:update` | Partial `{ subject, body, contactId, priority, assigneeId, status }` | `{ id }` — writes a `TicketEvent` row for status/priority/assignee changes |
| `deleteTicketAction(id)` | `ticket:delete` | — | `ActionResult` — soft delete (`deletedAt`), Owner/Admin only |
| `addCommentAction(raw)` | `comment:create` | `{ ticketId, body, isInternal }` | `{ id }` |

## Contacts (`src/app/(app)/contacts/actions.ts`)

| Action | Auth required | Input | Output |
| --- | --- | --- | --- |
| `createContactAction(raw)` | `ticket:create` | `{ name, email, company? }` | `{ id }` — rejects a duplicate email within the org |
| `updateContactAction(id, raw)` | `ticket:create` | Partial `{ name, email, company }` | `{ id }` |
| `deleteContactAction(id)` | `ticket:delete` | — | `ActionResult` |

## Search (`src/app/(app)/search-actions.ts`)

| Action | Auth required | Input | Output |
| --- | --- | --- | --- |
| `performGlobalSearch(query)` | Signed in | `query: string` | `{ tickets: [...], contacts: [...] }` — powers the ⌘K command palette, org-scoped, debounced client-side |

## Settings — Profile (`src/app/(app)/settings/profile/actions.ts`)

| Action | Auth required | Input | Output |
| --- | --- | --- | --- |
| `updateProfileAction(raw)` | Signed in | `{ name, image? }` | `ActionResult` |
| `changePasswordAction(raw)` | Signed in | `{ currentPassword, newPassword, confirmPassword }` | `ActionResult` — verifies the current password, rate-limited 5/15min |

## Settings — Organization (`src/app/(app)/settings/organization/actions.ts`)

| Action | Auth required | Input | Output |
| --- | --- | --- | --- |
| `updateOrganizationAction(raw)` | `org:edit` | `{ name }` | `ActionResult` |

## Settings — Members (`src/app/(app)/settings/members/actions.ts`)

| Action | Auth required | Input | Output |
| --- | --- | --- | --- |
| `addMemberAction(raw)` | `member:manage` | `{ name, email, role }` | `{ id, inviteUrl: string \| null }` — creates the user with no password; `inviteUrl` is a claim-account link (dev mode) |
| `changeMemberRoleAction(id, raw)` | `member:manage` | `{ role }` | `ActionResult` — only an Owner can assign Owner/Admin; actor must outrank (or be Owner over) the target; blocks demoting the last Owner |
| `removeMemberAction(id)` | `member:manage` | — | `ActionResult` — detaches (`orgId: null`) rather than deletes, preserving ticket/comment history; blocks removing the last Owner |

## Route Handlers (`src/app/api/`)

| Method | Path | Auth required | Output |
| --- | --- | --- | --- |
| `GET`/`POST` | `/api/auth/[...nextauth]` | — | Auth.js's own handler — session, CSRF, OAuth callbacks |
| `GET` | `/api/tickets/export` | Signed in | `text/csv` — respects the same `q`/`status`/`priority`/`sort` query params as the ticket list |
| `GET` | `/api/tickets/[id]/pdf` | Signed in, org-scoped | `application/pdf` — single-ticket summary generated with `pdf-lib` |

Both exports are rate-limit-eligible sensitive routes per the brief's spec; the rate limiter is
already wired for auth — see `docs/decisions.md` for what's covered today versus the documented
follow-up.

## Authorization model

`can({ role }, action)` in `src/lib/auth/permissions.ts` is the single source of truth for "is
this role allowed to do X" — both the UI (to hide controls) and every action above call it
independently. Never trust a role sent from the client: the action re-derives `role` from the
signed session on every call, not from anything the request body claims.
