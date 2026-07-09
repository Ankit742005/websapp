import type { Metadata } from "next";
import Link from "next/link";
import { getTenant } from "@/lib/dal/context";
import { getTickets } from "@/lib/dal/tickets";
import { can } from "@/lib/auth/permissions";
import type { Role, TicketStatus, TicketPriority } from "@/lib/constants/enums";
import { STATUS_META, PRIORITY_META } from "@/lib/constants/display";
import { StatusDot } from "@/components/status-dot";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, MessageSquare, ArrowUp, ArrowDown } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { DataTableToolbar } from "@/components/tickets/data-table-toolbar";
import { DataTablePagination } from "@/components/tickets/data-table-pagination";
import { ExportCSVButton } from "@/components/tickets/export-buttons";

export const metadata: Metadata = { title: "Tickets" };

type SearchParams = { [key: string]: string | string[] | undefined };

// Helper for sorting headers
function SortableHeader({ 
  field, 
  children, 
  className,
  currentSort,
  query,
  status,
  priority,
  assigneeId
}: { 
  field: string, 
  children: React.ReactNode, 
  className?: string,
  currentSort: string,
  query?: string,
  status?: string,
  priority?: string,
  assigneeId?: string
}) {
  const isSorted = currentSort.startsWith(field);
  const isAsc = currentSort === `${field}.asc`;
  const nextSort = isAsc ? `${field}.desc` : `${field}.asc`;
  
  // Build query string keeping other params
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (status) params.set("status", status);
  if (priority) params.set("priority", priority);
  if (assigneeId) params.set("assignee", assigneeId);
  params.set("sort", nextSort);
  const href = `?${params.toString()}`;

  return (
    <TableHead className={className}>
      <Link href={href} className="flex items-center hover:text-foreground group-hover:text-foreground">
        {children}
        {isSorted && (
          isAsc ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />
        )}
      </Link>
    </TableHead>
  );
}

export default async function TicketsPage(props: { searchParams: Promise<SearchParams> }) {
  const searchParams = await props.searchParams;
  const { user } = await getTenant();
  const { orgId } = await getTenant();

  const query = typeof searchParams.q === "string" ? searchParams.q : undefined;
  const status = typeof searchParams.status === "string" ? searchParams.status : undefined;
  const priority = typeof searchParams.priority === "string" ? searchParams.priority : undefined;
  const assigneeId = typeof searchParams.assignee === "string" ? searchParams.assignee : undefined;
  const sort = typeof searchParams.sort === "string" ? searchParams.sort : "createdAt.desc";
  const page = typeof searchParams.page === "string" ? parseInt(searchParams.page, 10) : 1;
  const pageSize = 25;

  const { tickets, totalCount } = await getTickets(orgId, {
    query,
    status,
    priority,
    assigneeId,
    sort,
    page: isNaN(page) ? 1 : page,
    pageSize,
  });
  
  const canCreate = can({ role: user.role as Role }, "ticket:create");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tickets</h1>
          <p className="text-sm text-muted-foreground">
            {totalCount} {totalCount === 1 ? "ticket" : "tickets"} found
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportCSVButton />
          {canCreate && (
            <Button asChild>
              <Link href="/tickets/new">
                <Plus className="mr-2 size-4" />
                New ticket
              </Link>
            </Button>
          )}
        </div>
      </div>

      <DataTableToolbar />

      {tickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
          <p className="text-sm text-muted-foreground">
            No tickets found. Try adjusting your filters.
          </p>
          {canCreate && (
            <Button asChild variant="outline" className="mt-4">
              <Link href="/tickets/new">
                <Plus className="mr-2 size-4" />
                Create ticket
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">#</TableHead>
                <TableHead>Subject</TableHead>
                <SortableHeader 
                  field="status" 
                  className="hidden md:table-cell"
                  currentSort={sort} query={query} status={status} priority={priority} assigneeId={assigneeId}
                >
                  Status
                </SortableHeader>
                <SortableHeader 
                  field="priority" 
                  className="hidden md:table-cell"
                  currentSort={sort} query={query} status={status} priority={priority} assigneeId={assigneeId}
                >
                  Priority
                </SortableHeader>
                <TableHead className="hidden lg:table-cell">Contact</TableHead>
                <TableHead className="hidden lg:table-cell">Assignee</TableHead>
                <SortableHeader 
                  field="createdAt" 
                  className="hidden sm:table-cell text-right justify-end"
                  currentSort={sort} query={query} status={status} priority={priority} assigneeId={assigneeId}
                >
                  Created
                </SortableHeader>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map((ticket) => (
                <TableRow key={ticket.id} className="group">
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
                      <StatusDot
                        meta={PRIORITY_META[ticket.priority as TicketPriority]}
                        className="text-xs"
                      />
                    </div>
                    {ticket._count.comments > 0 && (
                      <span className="ml-2 inline-flex items-center gap-0.5 text-xs text-muted-foreground">
                        <MessageSquare className="size-3" />
                        {ticket._count.comments}
                      </span>
                    )}
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
                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                    {ticket.contact.name}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {ticket.assignee ? (
                      <div className="flex items-center gap-2">
                        <Avatar className="size-6">
                          <AvatarImage
                            src={ticket.assignee.image ?? undefined}
                          />
                          <AvatarFallback className="text-[10px]">
                            {(ticket.assignee.name ?? "?")[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">
                          {ticket.assignee.name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-right text-sm text-muted-foreground">
                    {formatDistanceToNow(ticket.createdAt, {
                      addSuffix: true,
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          <DataTablePagination totalCount={totalCount} pageSize={pageSize} />
        </div>
      )}
    </div>
  );
}
