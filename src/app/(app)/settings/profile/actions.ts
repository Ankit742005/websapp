"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getTenant } from "@/lib/dal/context";
import { writeAuditLog } from "@/lib/dal/audit";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { updateProfileSchema, changePasswordSchema } from "@/lib/validations/profile";
import { fieldErrorsOf } from "@/lib/validations/errors";
import { ok, fail, type ActionResult } from "@/lib/action-result";

export async function updateProfileAction(raw: unknown): Promise<ActionResult> {
  const { user, orgId } = await getTenant();

  const parsed = updateProfileSchema.safeParse(raw);
  if (!parsed.success) {
    return fail("Please fix the errors below.", fieldErrorsOf(parsed.error));
  }
  const { name, image } = parsed.data;

  await prisma.user.update({
    where: { id: user.id },
    data: { name, image: image ? image : null },
  });

  await writeAuditLog({
    orgId,
    actorId: user.id,
    action: "profile.updated",
    entity: "User",
    entityId: user.id,
    summary: `${user.name ?? user.email} updated their profile`,
    after: { name, image: image || null },
  });

  revalidatePath("/settings/profile");
  return ok(undefined);
}

export async function changePasswordAction(raw: unknown): Promise<ActionResult> {
  const { user, orgId } = await getTenant();

  // Verifying `currentPassword` is a secret-guessing surface — rate-limit it
  // the same way login is, keyed by the account rather than IP+email.
  const ip = clientIp(await headers());
  const limit = rateLimit(`change-password:${ip}:${user.id}`, 5, 15 * 60 * 1000);
  if (!limit.ok) {
    return fail(`Too many attempts. Try again in ${limit.retryAfter}s.`);
  }

  const parsed = changePasswordSchema.safeParse(raw);
  if (!parsed.success) {
    return fail("Please fix the errors below.", fieldErrorsOf(parsed.error));
  }
  const { currentPassword, newPassword } = parsed.data;

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { passwordHash: true },
  });
  if (!dbUser?.passwordHash) {
    return fail("This account signs in via OAuth and has no password to change.");
  }

  const valid = await verifyPassword(currentPassword, dbUser.passwordHash);
  if (!valid) {
    return fail("Current password is incorrect.", {
      currentPassword: ["Current password is incorrect"],
    });
  }

  const passwordHash = await hashPassword(newPassword);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

  await writeAuditLog({
    orgId,
    actorId: user.id,
    action: "password.changed",
    entity: "User",
    entityId: user.id,
    summary: `${user.name ?? user.email} changed their password`,
  });

  return ok(undefined);
}
