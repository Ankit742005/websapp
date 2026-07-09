import { prisma } from "@/lib/db";
import { subDays, startOfDay, format } from "date-fns";

/**
 * M4: Dashboard & Analytics DAL
 * Aggregates ticket data for the dashboard charts and KPI cards.
 * Uses a default 30-day window for trends.
 */

const WINDOW_DAYS = 30;

export async function getDashboardKPIs(orgId: string) {
  const now = new Date();
  const windowStart = subDays(startOfDay(now), WINDOW_DAYS);

  // 1. Total currently open (not restricted by date)
  const openCount = await prisma.ticket.count({
    where: {
      orgId,
      deletedAt: null,
      status: { in: ["OPEN", "IN_PROGRESS", "WAITING"] },
    },
  });

  // 2. Tickets created and resolved within the window
  const ticketsInWindow = await prisma.ticket.findMany({
    where: {
      orgId,
      deletedAt: null,
      createdAt: { gte: windowStart },
    },
    select: {
      status: true,
      createdAt: true,
      firstResponseAt: true,
      resolvedAt: true,
    },
  });

  const createdCount = ticketsInWindow.length;
  let resolvedCount = 0;
  let sumFirstResponseMs = 0;
  let firstResponseCount = 0;

  for (const t of ticketsInWindow) {
    if (t.status === "RESOLVED" || t.status === "CLOSED") {
      resolvedCount++;
    }
    if (t.firstResponseAt) {
      sumFirstResponseMs += t.firstResponseAt.getTime() - t.createdAt.getTime();
      firstResponseCount++;
    }
  }

  const resolutionRate = createdCount === 0 ? 0 : Math.round((resolvedCount / createdCount) * 100);
  const avgFirstResponseHours = firstResponseCount === 0 
    ? 0 
    : (sumFirstResponseMs / firstResponseCount) / (1000 * 60 * 60);

  return {
    openCount,
    resolvedCount,
    resolutionRate,
    avgFirstResponseHours: Number(avgFirstResponseHours.toFixed(1)),
  };
}

export async function getTicketVolumeSeries(orgId: string) {
  const now = new Date();
  const windowStart = subDays(startOfDay(now), WINDOW_DAYS - 1); // 30 days including today

  // Fetch all tickets created OR resolved in the window
  const tickets = await prisma.ticket.findMany({
    where: {
      orgId,
      deletedAt: null,
      OR: [
        { createdAt: { gte: windowStart } },
        { resolvedAt: { gte: windowStart } },
      ],
    },
    select: { createdAt: true, resolvedAt: true },
  });

  // Initialize a bucket for each day
  const series: Record<string, { date: string; created: number; resolved: number }> = {};
  for (let i = 0; i < WINDOW_DAYS; i++) {
    const day = subDays(startOfDay(now), WINDOW_DAYS - 1 - i);
    const dayStr = format(day, "MMM dd");
    series[dayStr] = { date: dayStr, created: 0, resolved: 0 };
  }

  // Populate buckets
  for (const t of tickets) {
    if (t.createdAt >= windowStart) {
      const dayStr = format(t.createdAt, "MMM dd");
      if (series[dayStr]) series[dayStr].created++;
    }
    if (t.resolvedAt && t.resolvedAt >= windowStart) {
      const dayStr = format(t.resolvedAt, "MMM dd");
      if (series[dayStr]) series[dayStr].resolved++;
    }
  }

  return Object.values(series);
}

export async function getTicketsByStatus(orgId: string) {
  const groups = await prisma.ticket.groupBy({
    by: ["status"],
    where: { orgId, deletedAt: null },
    _count: { id: true },
  });

  return groups.map((g) => ({
    name: g.status,
    value: g._count.id,
  }));
}

export async function getTicketsByPriority(orgId: string) {
  const groups = await prisma.ticket.groupBy({
    by: ["priority"],
    where: { 
      orgId, 
      deletedAt: null,
      status: { in: ["OPEN", "IN_PROGRESS", "WAITING"] } // Only active tickets
    },
    _count: { id: true },
  });

  return groups.map((g) => ({
    name: g.priority,
    value: g._count.id,
  }));
}

export async function getAgentLeaderboard(orgId: string) {
  const now = new Date();
  const windowStart = subDays(startOfDay(now), WINDOW_DAYS);

  const groups = await prisma.ticket.groupBy({
    by: ["assigneeId"],
    where: {
      orgId,
      deletedAt: null,
      status: { in: ["RESOLVED", "CLOSED"] },
      resolvedAt: { gte: windowStart },
      assigneeId: { not: null },
    },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: 5,
  });

  if (groups.length === 0) return [];

  // Fetch names for these agents
  const users = await prisma.user.findMany({
    where: { id: { in: groups.map(g => g.assigneeId!) } },
    select: { id: true, name: true, email: true },
  });

  const userMap = new Map(users.map(u => [u.id, u.name ?? u.email.split('@')[0]]));

  return groups.map(g => ({
    name: userMap.get(g.assigneeId!) ?? "Unknown",
    resolved: g._count.id,
  }));
}
