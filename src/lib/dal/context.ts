import "server-only";
import { requireOrg, type SessionUser } from "@/lib/auth/session";

/**
 * Tenant context resolved once per request. Every DAL query is scoped by
 * `orgId`, so a query can never cross an organization boundary by accident
 * (§ "authorize every mutation at the row level").
 */
export interface TenantContext {
  user: SessionUser;
  orgId: string;
}

export async function getTenant(): Promise<TenantContext> {
  const { user, orgId } = await requireOrg();
  return { user, orgId };
}
