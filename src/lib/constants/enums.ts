import { z } from "zod";

/**
 * Domain enumerations. SQLite has no native enum type, so these `as const`
 * tuples are the single source of truth — the Prisma columns are strings, and
 * every boundary (forms, actions, API) validates against the matching Zod enum.
 */

export const ROLES = ["OWNER", "ADMIN", "AGENT", "VIEWER"] as const;
export type Role = (typeof ROLES)[number];
export const roleSchema = z.enum(ROLES);

/** Higher number = more privilege. Used for "can I act on this role?" checks. */
export const ROLE_RANK: Record<Role, number> = {
  VIEWER: 0,
  AGENT: 1,
  ADMIN: 2,
  OWNER: 3,
};

export const TICKET_STATUSES = [
  "OPEN",
  "IN_PROGRESS",
  "WAITING",
  "RESOLVED",
  "CLOSED",
] as const;
export type TicketStatus = (typeof TICKET_STATUSES)[number];
export const ticketStatusSchema = z.enum(TICKET_STATUSES);

/** Statuses that count as "still needs work" for dashboards and SLA. */
export const OPEN_STATUSES: readonly TicketStatus[] = [
  "OPEN",
  "IN_PROGRESS",
  "WAITING",
];

export const TICKET_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;
export type TicketPriority = (typeof TICKET_PRIORITIES)[number];
export const ticketPrioritySchema = z.enum(TICKET_PRIORITIES);

export const PRIORITY_RANK: Record<TicketPriority, number> = {
  LOW: 0,
  MEDIUM: 1,
  HIGH: 2,
  URGENT: 3,
};

export const AUDIT_ACTIONS = [
  "ticket.created",
  "ticket.updated",
  "ticket.status_changed",
  "ticket.assigned",
  "ticket.deleted",
  "ticket.restored",
  "comment.created",
  "contact.created",
  "contact.updated",
  "contact.deleted",
  "member.invited",
  "member.role_changed",
  "member.removed",
  "tag.created",
  "tag.deleted",
  "profile.updated",
  "password.changed",
  "organization.updated",
] as const;
export type AuditAction = (typeof AUDIT_ACTIONS)[number];

/** Timeline event types stored per ticket (see TicketEvent). */
export const TICKET_EVENT_TYPES = [
  "created",
  "status_changed",
  "priority_changed",
  "assigned",
  "unassigned",
  "reopened",
] as const;
export type TicketEventType = (typeof TICKET_EVENT_TYPES)[number];
