import "server-only";
import { prisma } from "@/lib/db";

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
  assignee: { id: string; name: string | null; image: string | null } | null;
  contact: { id: string; name: string; email: string };
  _count: { comments: number };
}

/**
 * Fetch all non-deleted tickets for the org. Basic query for M3 — the rich
 * filter/sort/paginate version is M5.
 */
export async function getTickets(orgId: string): Promise<TicketListItem[]> {
  return prisma.ticket.findMany({
    where: { orgId, deletedAt: null },
    include: {
      assignee: { select: { id: true, name: true, image: true } },
      contact: { select: { id: true, name: true, email: true } },
      _count: { select: { comments: true } },
    },
    orderBy: { createdAt: "desc" },
  });
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
