import "server-only";
import { prisma } from "@/lib/db";
import type { AuditAction } from "@/lib/constants/enums";

export interface WriteAuditLogParams {
  orgId: string;
  actorId: string;
  action: AuditAction;
  entity: string;
  entityId: string;
  summary: string;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
}

/**
 * Write an immutable audit-log row. Called by every mutation server action
 * after the primary write succeeds. `before`/`after` are stored as JSON
 * strings for the audit-log UI diff viewer (M7).
 */
export async function writeAuditLog(params: WriteAuditLogParams): Promise<void> {
  await prisma.auditLog.create({
    data: {
      orgId: params.orgId,
      actorId: params.actorId,
      action: params.action,
      entity: params.entity,
      entityId: params.entityId,
      summary: params.summary,
      before: params.before ? JSON.stringify(params.before) : null,
      after: params.after ? JSON.stringify(params.after) : null,
    },
  });
}
