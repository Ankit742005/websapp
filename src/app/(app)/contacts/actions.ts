"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getTenant } from "@/lib/dal/context";
import { writeAuditLog } from "@/lib/dal/audit";
import { can } from "@/lib/auth/permissions";
import {
  createContactSchema,
  updateContactSchema,
} from "@/lib/validations/contact";
import { fieldErrorsOf } from "@/lib/validations/errors";
import { ok, fail, type ActionResult } from "@/lib/action-result";
import type { Role } from "@/lib/constants/enums";

// ──────────────────────────── Create contact ────────────────────────────────

export async function createContactAction(
  raw: unknown,
): Promise<ActionResult<{ id: string }>> {
  const { user, orgId } = await getTenant();
  if (!can({ role: user.role as Role }, "ticket:create")) {
    return fail("You don't have permission to create contacts.");
  }

  const parsed = createContactSchema.safeParse(raw);
  if (!parsed.success) {
    return fail("Please fix the errors below.", fieldErrorsOf(parsed.error));
  }

  const { name, email, company } = parsed.data;

  // Check for duplicate email within this org.
  const existing = await prisma.contact.findUnique({
    where: { orgId_email: { orgId, email } },
  });
  if (existing) {
    return fail("A contact with this email already exists in your workspace.", {
      email: ["Email already in use"],
    });
  }

  const contact = await prisma.contact.create({
    data: { orgId, name, email, company: company ?? null },
    select: { id: true },
  });

  await writeAuditLog({
    orgId,
    actorId: user.id,
    action: "contact.created",
    entity: "Contact",
    entityId: contact.id,
    summary: `Created contact: ${name} (${email})`,
    after: { name, email, company: company ?? null },
  });

  revalidatePath("/contacts");
  return ok({ id: contact.id });
}

// ──────────────────────────── Update contact ────────────────────────────────

export async function updateContactAction(
  contactId: string,
  raw: unknown,
): Promise<ActionResult<{ id: string }>> {
  const { user, orgId } = await getTenant();
  if (!can({ role: user.role as Role }, "ticket:create")) {
    return fail("You don't have permission to update contacts.");
  }

  const parsed = updateContactSchema.safeParse(raw);
  if (!parsed.success) {
    return fail("Please fix the errors below.", fieldErrorsOf(parsed.error));
  }

  const existing = await prisma.contact.findFirst({
    where: { id: contactId, orgId },
  });
  if (!existing) return fail("Contact not found.");

  const data = parsed.data;

  // If email is being changed, check for duplicates.
  if (data.email && data.email !== existing.email) {
    const dup = await prisma.contact.findUnique({
      where: { orgId_email: { orgId, email: data.email } },
    });
    if (dup) {
      return fail("Another contact with this email already exists.", {
        email: ["Email already in use"],
      });
    }
  }

  await prisma.contact.update({
    where: { id: contactId },
    data: {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.email !== undefined ? { email: data.email } : {}),
      ...(data.company !== undefined ? { company: data.company ?? null } : {}),
    },
  });

  await writeAuditLog({
    orgId,
    actorId: user.id,
    action: "contact.updated",
    entity: "Contact",
    entityId: contactId,
    summary: `Updated contact: ${existing.name}`,
    before: { name: existing.name, email: existing.email, company: existing.company },
    after: data as Record<string, unknown>,
  });

  revalidatePath("/contacts");
  revalidatePath(`/contacts/${contactId}`);
  return ok({ id: contactId });
}

// ──────────────────────────── Delete contact ────────────────────────────────

export async function deleteContactAction(
  contactId: string,
): Promise<ActionResult> {
  const { user, orgId } = await getTenant();
  if (!can({ role: user.role as Role }, "ticket:delete")) {
    return fail("You don't have permission to delete contacts.");
  }

  const contact = await prisma.contact.findFirst({
    where: { id: contactId, orgId },
    select: { id: true, name: true, email: true },
  });
  if (!contact) return fail("Contact not found.");

  await prisma.contact.delete({ where: { id: contactId } });

  await writeAuditLog({
    orgId,
    actorId: user.id,
    action: "contact.deleted",
    entity: "Contact",
    entityId: contactId,
    summary: `Deleted contact: ${contact.name} (${contact.email})`,
  });

  revalidatePath("/contacts");
  return ok(undefined);
}
