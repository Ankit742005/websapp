import "server-only";
import { prisma } from "@/lib/db";
import { Prisma } from "@/generated/prisma/client";

/**
 * Ticket list item — the shape returned by `getTickets`. Includes the
 * denormalized fields the ticket table needs without over-fetching.
 */
export interface TicketListItem {
  id: string;
  number: number;
  subject: string;
  status: string;
  priority: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt: Date | null;
  assignee: { id: string; name: string | null; image: string | null } | null;
  contact: { id: string; name: string; email: string };
  _count: { comments: number };
}

export interface GetTicketsOptions {
  query?: string;
  status?: string;
  priority?: string;
  assigneeId?: string;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * Fetch all non-deleted tickets for the org with filtering, sorting, and pagination.
 */
export async function getTickets(orgId: string, options?: GetTicketsOptions) {
  const { query, status, priority, assigneeId, sort = "createdAt.desc", page = 1, pageSize = 25 } = options ?? {};

  // Build the where clause
  const where: Prisma.TicketWhereInput = { orgId, deletedAt: null };

  if (query) {
    // SQLite's `contains` is case-insensitive by default for ASCII text.
    where.OR = [
      { subject: { contains: query } },
      { contact: { name: { contains: query } } },
      { contact: { email: { contains: query } } },
    ];
  }
  if (status) where.status = status;
  if (priority) where.priority = priority;
  if (assigneeId) {
    where.assigneeId = assigneeId === "unassigned" ? null : assigneeId;
  }

  // Build the orderBy clause
  const orderBy: Prisma.TicketOrderByWithRelationInput = {};
  const parts = sort.split(".");
  const sortField = parts[0] ?? "createdAt";
  const sortDir: Prisma.SortOrder = parts[1] === "asc" ? "asc" : "desc";
  if (
    sortField === "createdAt" ||
    sortField === "updatedAt" ||
    sortField === "priority" ||
    sortField === "status"
  ) {
    orderBy[sortField] = sortDir;
  } else {
    orderBy.createdAt = "desc";
  }

  const skip = (page - 1) * pageSize;

  const [tickets, totalCount] = await Promise.all([
    prisma.ticket.findMany({
      where,
      include: {
        assignee: { select: { id: true, name: true, image: true } },
        contact: { select: { id: true, name: true, email: true } },
        _count: { select: { comments: true } },
      },
      orderBy,
      skip,
      take: pageSize > 0 ? pageSize : undefined, // If pageSize is 0, fetch all (for exports)
    }),
    prisma.ticket.count({ where }),
  ]);

  return { tickets: tickets as TicketListItem[], totalCount };
}

/** Full ticket detail with comments, events, tags, and related entities. */
export async function getTicketWithDetails(orgId: string, ticketId: string) {
  return prisma.ticket.findFirst({
    where: { id: ticketId, orgId, deletedAt: null },
    include: {
      assignee: { select: { id: true, name: true, email: true, image: true } },
      contact: { select: { id: true, name: true, email: true, company: true } },
      comments: {
        include: {
          author: { select: { id: true, name: true, email: true, image: true } },
        },
        orderBy: { createdAt: "asc" },
      },
      events: { orderBy: { createdAt: "asc" } },
      tags: { include: { tag: true } },
    },
  });
}

/** Lightweight ticket lookup for edit forms. */
export async function getTicket(orgId: string, ticketId: string) {
  return prisma.ticket.findFirst({
    where: { id: ticketId, orgId, deletedAt: null },
    include: {
      contact: { select: { id: true, name: true, email: true } },
      assignee: { select: { id: true, name: true } },
    },
  });
}
