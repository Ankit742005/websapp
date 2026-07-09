import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getTenant } from "@/lib/dal/context";
import { getTicketWithDetails } from "@/lib/dal/tickets";
import { getMembers } from "@/lib/dal/members";
import { can } from "@/lib/auth/permissions";
import type { Role, TicketStatus, TicketPriority } from "@/lib/constants/enums";
import { STATUS_META, PRIORITY_META } from "@/lib/constants/display";
import { StatusDot } from "@/components/status-dot";
import { TicketStatusSelect } from "@/components/tickets/ticket-status-select";
import { TicketPrioritySelect } from "@/components/tickets/ticket-priority-select";
import { TicketAssigneeSelect } from "@/components/tickets/ticket-assignee-select";
import { CommentThread } from "@/components/tickets/comment-thread";
import { CommentForm } from "@/components/tickets/comment-form";
import { TicketTimeline } from "@/components/tickets/ticket-timeline";
import { DeleteTicketButton } from "./delete-ticket-button";
import { ExportPDFButton } from "@/components/tickets/export-buttons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Pencil, User, Calendar, Mail } from "lucide-react";
import { format } from "date-fns";

interface TicketDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: TicketDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const { orgId } = await getTenant();
  const ticket = await getTicketWithDetails(orgId, id);
  if (!ticket) return { title: "Ticket not found" };
  return { title: `#${ticket.number} ${ticket.subject}` };
}

export default async function TicketDetailPage({
  params,
}: TicketDetailPageProps) {
  const { id } = await params;
  const { user, orgId } = await getTenant();
  const [ticket, members] = await Promise.all([
    getTicketWithDetails(orgId, id),
    getMembers(orgId),
  ]);

  if (!ticket) notFound();

  const canUpdate = can({ role: user.role as Role }, "ticket:update");
  const canDelete = can({ role: user.role as Role }, "ticket:delete");
  const canComment = can({ role: user.role as Role }, "comment:create");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="icon" className="size-8">
              <Link href="/tickets">
                <ArrowLeft className="size-4" />
              </Link>
            </Button>
            <Badge variant="secondary" className="font-mono text-xs">
              #{ticket.number}
            </Badge>
            <StatusDot
              meta={STATUS_META[ticket.status as TicketStatus]}
            />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">
            {ticket.subject}
          </h1>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <ExportPDFButton ticketId={ticket.id} />
          {canUpdate && (
            <Button asChild variant="outline" size="sm">
              <Link href={`/tickets/${ticket.id}/edit`}>
                <Pencil className="mr-2 size-3.5" />
                Edit
              </Link>
            </Button>
          )}
          {canDelete && <DeleteTicketButton ticketId={ticket.id} />}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        {/* Main content */}
        <div className="space-y-6">
          {/* Body */}
          <div className="rounded-xl border p-5">
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              {ticket.body}
            </div>
          </div>

          {/* Comments */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Comments</h2>
            <CommentThread comments={ticket.comments} />
            {canComment && <CommentForm ticketId={ticket.id} />}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-5">
          <div className="rounded-xl border p-4 space-y-4">
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase text-muted-foreground">
                Status
              </p>
              {canUpdate ? (
                <TicketStatusSelect
                  ticketId={ticket.id}
                  currentStatus={ticket.status as TicketStatus}
                />
              ) : (
                <StatusDot
                  meta={STATUS_META[ticket.status as TicketStatus]}
                />
              )}
            </div>

            <Separator />

            <div className="space-y-2">
              <p className="text-xs font-medium uppercase text-muted-foreground">
                Priority
              </p>
              {canUpdate ? (
                <TicketPrioritySelect
                  ticketId={ticket.id}
                  currentPriority={ticket.priority as TicketPriority}
                />
              ) : (
                <StatusDot
                  meta={PRIORITY_META[ticket.priority as TicketPriority]}
                />
              )}
            </div>

            <Separator />

            <div className="space-y-2">
              <p className="text-xs font-medium uppercase text-muted-foreground">
                Assignee
              </p>
              {canUpdate ? (
                <TicketAssigneeSelect
                  ticketId={ticket.id}
                  currentAssigneeId={ticket.assigneeId}
                  members={members}
                />
              ) : (
                <p className="text-sm">
                  {ticket.assignee
                    ? (ticket.assignee.name ?? ticket.assignee.email)
                    : "Unassigned"}
                </p>
              )}
            </div>

            <Separator />

            <div className="space-y-2">
              <p className="text-xs font-medium uppercase text-muted-foreground">
                Contact
              </p>
              <div className="flex items-center gap-2 text-sm">
                <User className="size-3.5 text-muted-foreground" />
                <Link
                  href={`/contacts/${ticket.contactId}`}
                  className="hover:text-primary hover:underline"
                >
                  {ticket.contact.name}
                </Link>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Mail className="size-3 text-muted-foreground" />
                {ticket.contact.email}
              </div>
            </div>

            <Separator />

            <div className="space-y-1 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="size-3" />
                Created {format(ticket.createdAt, "MMM d, yyyy 'at' h:mm a")}
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="size-3" />
                Updated {format(ticket.updatedAt, "MMM d, yyyy 'at' h:mm a")}
              </div>
            </div>
          </div>

          {/* Timeline */}
          <TicketTimeline events={ticket.events} />
        </aside>
      </div>
    </div>
  );
}
