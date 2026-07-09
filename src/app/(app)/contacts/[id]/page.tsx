import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getTenant } from "@/lib/dal/context";
import { getContactWithTickets } from "@/lib/dal/contacts";
import { can } from "@/lib/auth/permissions";
import type { Role, TicketStatus, TicketPriority } from "@/lib/constants/enums";
import { STATUS_META, PRIORITY_META } from "@/lib/constants/display";
import { StatusDot } from "@/components/status-dot";
import { DeleteContactButton } from "./delete-contact-button";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Pencil, Building2, Mail, Calendar } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

interface ContactDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: ContactDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const { orgId } = await getTenant();
  const contact = await getContactWithTickets(orgId, id);
  if (!contact) return { title: "Contact not found" };
  return { title: contact.name };
}

export default async function ContactDetailPage({
  params,
}: ContactDetailPageProps) {
  const { id } = await params;
  const { user, orgId } = await getTenant();
  const contact = await getContactWithTickets(orgId, id);

  if (!contact) notFound();

  const canUpdate = can({ role: user.role as Role }, "ticket:update"); // Reusing ticket roles for M3
  const canDelete = can({ role: user.role as Role }, "ticket:delete");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon" className="size-8">
            <Link href="/contacts">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div className="space-y-1">
            <h1 className="text-xl font-semibold tracking-tight">
              {contact.name}
            </h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Mail className="size-3.5" />
                {contact.email}
              </span>
              {contact.company && (
                <span className="flex items-center gap-1.5">
                  <Building2 className="size-3.5" />
                  {contact.company}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canUpdate && (
            <Button asChild variant="outline" size="sm">
              <Link href={`/contacts/${contact.id}/edit`}>
                <Pencil className="mr-2 size-3.5" />
                Edit
              </Link>
            </Button>
          )}
          {canDelete && <DeleteContactButton contactId={contact.id} />}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        {/* Main content - Tickets */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold tracking-tight">Recent Tickets</h2>
          {contact.tickets.length === 0 ? (
            <div className="rounded-xl border border-dashed py-12 text-center text-sm text-muted-foreground">
              No tickets yet for this contact.
            </div>
          ) : (
            <div className="rounded-xl border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">#</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead className="hidden md:table-cell">Status</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Priority
                    </TableHead>
                    <TableHead className="text-right">Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contact.tickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {ticket.number}
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/tickets/${ticket.id}`}
                          className="font-medium hover:text-primary hover:underline"
                        >
                          {ticket.subject}
                        </Link>
                        <div className="mt-0.5 flex items-center gap-2 md:hidden">
                          <StatusDot
                            meta={STATUS_META[ticket.status as TicketStatus]}
                            className="text-xs"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <StatusDot
                          meta={STATUS_META[ticket.status as TicketStatus]}
                        />
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <StatusDot
                          meta={PRIORITY_META[ticket.priority as TicketPriority]}
                        />
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {formatDistanceToNow(ticket.createdAt, {
                          addSuffix: true,
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-5">
          <div className="rounded-xl border p-4 space-y-4 text-sm">
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase text-muted-foreground">
                Total Tickets
              </p>
              <p className="font-medium">{contact.tickets.length}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase text-muted-foreground">
                Added
              </p>
              <div className="flex items-center gap-2">
                <Calendar className="size-3.5 text-muted-foreground" />
                {format(contact.createdAt, "MMM d, yyyy")}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
