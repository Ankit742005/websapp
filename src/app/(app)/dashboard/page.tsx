import type { Metadata } from "next";
import { getTenant } from "@/lib/dal/context";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Dashboard" };

/**
 * Dashboard landing page. M3 shows quick summary stats; the full KPI cards
 * and charts are built in M4.
 */
export default async function DashboardPage() {
  const { orgId } = await getTenant();

  const [openCount, resolvedCount, contactCount] = await Promise.all([
    prisma.ticket.count({
      where: { orgId, deletedAt: null, status: { in: ["OPEN", "IN_PROGRESS", "WAITING"] } },
    }),
    prisma.ticket.count({
      where: { orgId, deletedAt: null, status: { in: ["RESOLVED", "CLOSED"] } },
    }),
    prisma.contact.count({ where: { orgId } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of your support workspace.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SummaryCard label="Open tickets" value={openCount} />
        <SummaryCard label="Resolved" value={resolvedCount} />
        <SummaryCard label="Contacts" value={contactCount} />
      </div>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-3xl font-bold tabular-nums">{value}</p>
    </div>
  );
}
