import { type Role, ROLE_RANK } from "@/lib/constants/enums";

/**
 * Every privileged operation in the app. UI hides controls the user can't use;
 * the server calls `can()` again before mutating — the server is the source of
 * truth (§ "never trust a role sent from the client").
 */
export type Action =
  | "ticket:create"
  | "ticket:update"
  | "ticket:delete"
  | "comment:create"
  | "tag:manage"
  | "audit:view"
  | "member:manage"
  | "member:setElevatedRole"
  | "org:edit"
  | "savedView:create"
  | "export";

const ABILITIES: Record<Role, ReadonlySet<Action> | "*"> = {
  OWNER: "*",
  ADMIN: new Set<Action>([
    "ticket:create",
    "ticket:update",
    "ticket:delete",
    "comment:create",
    "tag:manage",
    "audit:view",
    "member:manage",
    "org:edit",
    "savedView:create",
    "export",
  ]),
  AGENT: new Set<Action>([
    "ticket:create",
    "ticket:update",
    "comment:create",
    "savedView:create",
    "export",
  ]),
  VIEWER: new Set<Action>(["export"]),
};

export function can(
  user: { role: Role } | null | undefined,
  action: Action,
): boolean {
  if (!user) return false;
  const abilities = ABILITIES[user.role];
  return abilities === "*" || abilities.has(action);
}

/** True when `actor` outranks `target` (used for member management). */
export function outranks(actor: Role, target: Role): boolean {
  return ROLE_RANK[actor] > ROLE_RANK[target];
}

/** Roles an actor is allowed to assign — never above their own rank. */
export function assignableRoles(actor: Role): Role[] {
  const actorRank = ROLE_RANK[actor];
  return (Object.keys(ROLE_RANK) as Role[]).filter(
    (r) => ROLE_RANK[r] <= actorRank,
  );
}
