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

export interface AuditLogRow {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  summary: string;
  before: string | null;
  after: string | null;
  createdAt: Date;
  actor: { id: string; name: string | null; email: string } | null;
}

export interface AuditLogQuery {
  entity?: string;
  page?: number;
  pageSize?: number;
}

/**
 * Paginated, most-recent-first audit log for the org — the queryable
 * per-entity/per-org activity trail required by the brief ("immutable
 * audit/activity log... queryable per entity").
 */
export async function getAuditLogs(
  orgId: string,
  { entity, page = 1, pageSize = 25 }: AuditLogQuery = {},
): Promise<{ logs: AuditLogRow[]; totalCount: number }> {
  const where = { orgId, ...(entity ? { entity } : {}) };

  const [logs, totalCount] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      select: {
        id: true,
        action: true,
        entity: true,
        entityId: true,
        summary: true,
        before: true,
        after: true,
        createdAt: true,
        actor: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return { logs, totalCount };
}
