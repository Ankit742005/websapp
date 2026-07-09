import "server-only";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import type { Session } from "next-auth";

export type SessionUser = Session["user"];

/** Current user or null — for optional-auth surfaces (marketing, layout). */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await auth();
  return session?.user ?? null;
}

/** Require a signed-in user; otherwise redirect to login. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/** Require a user who belongs to an organization (the tenant boundary). */
export async function requireOrg(): Promise<{ user: SessionUser; orgId: string }> {
  const user = await requireUser();
  if (!user.orgId) redirect("/onboarding");
  return { user, orgId: user.orgId };
}

export function isVerified(user: SessionUser | null | undefined): boolean {
  return Boolean(user?.verified);
}
