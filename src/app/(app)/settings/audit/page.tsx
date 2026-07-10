import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { getTenant } from "@/lib/dal/context";
import { getAuditLogs } from "@/lib/dal/audit";
import { can } from "@/lib/auth/permissions";
import type { Role } from "@/lib/constants/enums";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { EntityFilter } from "./entity-filter";
import { DataTablePagination } from "@/components/tickets/data-table-pagination";

export const metadata: Metadata = { title: "Audit log" };

const ENTITIES = ["Ticket", "Contact", "User", "Organization"] as const;
const PAGE_SIZE = 25;

type SearchParams = { [key: string]: string | string[] | undefined };

export default async function AuditLogPage(props: {
  searchParams: Promise<SearchParams>;
}) {
  const { user, orgId } = await getTenant();
  if (!can({ role: user.role as Role }, "audit:view")) notFound();

  const searchParams = await props.searchParams;
  const entity = typeof searchParams.entity === "string" ? searchParams.entity : undefined;
  const pageRaw = typeof searchParams.page === "string" ? parseInt(searchParams.page, 10) : 1;
  const page = Number.isNaN(pageRaw) || pageRaw < 1 ? 1 : pageRaw;

  const { logs, totalCount } = await getAuditLogs(orgId, { entity, page, pageSize: PAGE_SIZE });

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Audit log</CardTitle>
          <CardDescription>
            {totalCount} recorded {totalCount === 1 ? "change" : "changes"} in this workspace.
          </CardDescription>
        </div>
        <EntityFilter entities={ENTITIES} current={entity} />
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
            <p className="text-sm text-muted-foreground">
              {entity ? `No ${entity.toLowerCase()} activity yet.` : "No activity recorded yet."}
            </p>
          </div>
        ) : (
          <ul className="divide-y">
            {logs.map((log) => (
              <li key={log.id} className="flex items-start gap-3 py-3">
                <Avatar className="mt-0.5 size-7 shrink-0">
                  <AvatarFallback className="text-[10px]">
                    {(log.actor?.name ?? log.actor?.email ?? "?")[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-sm">
                    <span className="font-medium">
                      {log.actor?.name ?? log.actor?.email ?? "System"}
                    </span>{" "}
                    <span className="text-muted-foreground">{log.summary}</span>
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">
                      {log.entity}
                    </Badge>
                    <time
                      dateTime={log.createdAt.toISOString()}
                      className="text-xs text-muted-foreground"
                    >
                      {formatDistanceToNow(log.createdAt, { addSuffix: true })}
                    </time>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        <DataTablePagination totalCount={totalCount} pageSize={PAGE_SIZE} />
      </CardContent>
    </Card>
  );
}
