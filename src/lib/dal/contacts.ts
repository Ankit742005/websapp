import "server-only";
import { prisma } from "@/lib/db";

export interface ContactListItem {
  id: string;
  name: string;
  email: string;
  company: string | null;
  createdAt: Date;
  _count: { tickets: number };
}

/** All contacts for the org, with a ticket count for the list view. */
export async function getContacts(orgId: string): Promise<ContactListItem[]> {
  return prisma.contact.findMany({
    where: { orgId },
    include: { _count: { select: { tickets: true } } },
    orderBy: { name: "asc" },
  });
}

/** Single contact with associated tickets for the detail page. */
export async function getContactWithTickets(orgId: string, contactId: string) {
  return prisma.contact.findFirst({
    where: { id: contactId, orgId },
    include: {
      tickets: {
        where: { deletedAt: null },
        select: {
          id: true,
          number: true,
          subject: true,
          status: true,
          priority: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

/** Lightweight contact lookup for edit forms. */
export async function getContact(orgId: string, contactId: string) {
  return prisma.contact.findFirst({
    where: { id: contactId, orgId },
  });
}
