"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getTenant } from "@/lib/dal/context";
import { writeAuditLog } from "@/lib/dal/audit";
import { can } from "@/lib/auth/permissions";
import { updateOrganizationSchema } from "@/lib/validations/organization";
import { fieldErrorsOf } from "@/lib/validations/errors";
import { ok, fail, type ActionResult } from "@/lib/action-result";
import type { Role } from "@/lib/constants/enums";

export async function updateOrganizationAction(raw: unknown): Promise<ActionResult> {
  const { user, orgId } = await getTenant();
  if (!can({ role: user.role as Role }, "org:edit")) {
    return fail("You don't have permission to edit organization settings.");
  }

  const parsed = updateOrganizationSchema.safeParse(raw);
  if (!parsed.success) {
    return fail("Please fix the errors below.", fieldErrorsOf(parsed.error));
  }
  const { name } = parsed.data;

  const existing = await prisma.organization.findUniqueOrThrow({
    where: { id: orgId },
    select: { name: true },
  });

  await prisma.organization.update({ where: { id: orgId }, data: { name } });

  await writeAuditLog({
    orgId,
    actorId: user.id,
    action: "organization.updated",
    entity: "Organization",
    entityId: orgId,
    summary: `Renamed workspace to "${name}"`,
    before: { name: existing.name },
    after: { name },
  });

  revalidatePath("/settings/organization");
  return ok(undefined);
}
