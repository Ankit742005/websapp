import "server-only";
import { prisma } from "@/lib/db";

export interface MemberSummary {
  id: string;
  name: string | null;
  email: string;
  role: string;
  image: string | null;
}

/**
 * List all users in the organization — used for assignee selects and member
 * management. Always scoped by `orgId` to enforce the tenant boundary.
 */
export async function getMembers(orgId: string): Promise<MemberSummary[]> {
  return prisma.user.findMany({
    where: { orgId },
    select: { id: true, name: true, email: true, role: true, image: true },
    orderBy: { name: "asc" },
  });
}
