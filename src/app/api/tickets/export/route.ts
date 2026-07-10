import { NextRequest } from "next/server";
import { getTenant } from "@/lib/dal/context";
import { getTickets } from "@/lib/dal/tickets";
import { format } from "date-fns";
import { STATUS_META, PRIORITY_META } from "@/lib/constants/display";
import type { TicketStatus, TicketPriority } from "@/lib/constants/enums";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  try {
    const { user, orgId } = await getTenant();

    const limit = rateLimit(`export-csv:${clientIp(req.headers)}:${user.id}`, 20, 5 * 60 * 1000);
    if (!limit.ok) {
      return new Response("Too many export requests. Try again shortly.", {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfter) },
      });
    }

    const searchParams = req.nextUrl.searchParams;

    const query = searchParams.get("q") ?? undefined;
    const status = searchParams.get("status") ?? undefined;
    const priority = searchParams.get("priority") ?? undefined;
    const assigneeId = searchParams.get("assignee") ?? undefined;
    const sort = searchParams.get("sort") ?? "createdAt.desc";

    // Fetch all matching tickets without pagination (pageSize = 0)
    const { tickets } = await getTickets(orgId, {
      query,
      status,
      priority,
      assigneeId,
      sort,
      pageSize: 0, 
    });

    // Generate CSV string
    const headers = [
      "ID",
      "Number",
      "Subject",
      "Status",
      "Priority",
      "Contact Name",
      "Contact Email",
      "Assignee",
      "Created At",
      "Resolved At",
    ];

    const rows = tickets.map((t) => [
      t.id,
      t.number.toString(),
      `"${t.subject.replace(/"/g, '""')}"`, // escape quotes
      STATUS_META[t.status as TicketStatus]?.label ?? t.status,
      PRIORITY_META[t.priority as TicketPriority]?.label ?? t.priority,
      `"${t.contact.name.replace(/"/g, '""')}"`,
      t.contact.email,
      t.assignee ? `"${t.assignee.name?.replace(/"/g, '""')}"` : "Unassigned",
      format(t.createdAt, "yyyy-MM-dd HH:mm:ss"),
      t.resolvedAt ? format(t.resolvedAt, "yyyy-MM-dd HH:mm:ss") : "",
    ]);

    const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="tickets_export.csv"',
      },
    });
  } catch (error) {
    console.error("CSV Export failed:", error);
    return new Response("Failed to generate export", { status: 500 });
  }
}
