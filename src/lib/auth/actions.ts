"use server";

import { headers } from "next/headers";
import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import {
  createToken,
  hashToken,
  EMAIL_VERIFICATION_TTL_MS,
  PASSWORD_RESET_TTL_MS,
} from "@/lib/auth/tokens";
import { sendEmail, absoluteUrl } from "@/lib/email";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "@/lib/validations/auth";
import { fieldErrorsOf } from "@/lib/validations/errors";
import { ok, fail, type ActionResult } from "@/lib/action-result";

function slugify(input: string): string {
  const base = input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32);
  return base || "workspace";
}

async function uniqueSlug(name: string): Promise<string> {
  const base = slugify(name);
  const taken = await prisma.organization.findUnique({ where: { slug: base } });
  if (!taken) return base;
  return `${base}-${Math.random().toString(36).slice(2, 6)}`;
}

// ─────────────────────────────── Login ──────────────────────────────────────

export async function loginAction(
  raw: unknown,
  callbackUrl?: string,
): Promise<ActionResult<never>> {
  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return fail("Enter your email and password.", fieldErrorsOf(parsed.error));
  }

  const ip = clientIp(await headers());
  const limit = rateLimit(`login:${ip}:${parsed.data.email}`, 5, 15 * 60 * 1000);
  if (!limit.ok) {
    return fail(`Too many attempts. Try again in ${limit.retryAfter}s.`);
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : "/dashboard",
    });
  } catch (error) {
    // A successful sign-in throws a redirect that must propagate.
    if (error instanceof AuthError) {
      return fail("Invalid email or password.");
    }
    throw error;
  }
  return ok(undefined as never);
}

// ───────────────────────────── Registration ─────────────────────────────────

export async function registerAction(
  raw: unknown,
): Promise<ActionResult<{ verifyUrl: string | null }>> {
  const ip = clientIp(await headers());
  const limit = rateLimit(`register:${ip}`, 5, 15 * 60 * 1000);
  if (!limit.ok) {
    return fail(`Too many attempts. Try again in ${limit.retryAfter}s.`);
  }

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return fail("Please fix the errors below.", fieldErrorsOf(parsed.error));
  }
  const { name, orgName, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return fail("An account with this email already exists.", {
      email: ["Email already in use"],
    });
  }

  const [slug, passwordHash] = await Promise.all([
    uniqueSlug(orgName),
    hashPassword(password),
  ]);
  const { token, tokenHash } = createToken();

  await prisma.$transaction(async (tx) => {
    const org = await tx.organization.create({
      data: { name: orgName, slug },
    });
    const user = await tx.user.create({
      data: { name, email, passwordHash, role: "OWNER", orgId: org.id },
    });
    await tx.emailVerificationToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expires: new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS),
      },
    });
  });

  const verifyUrl = absoluteUrl(`/verify?token=${token}`);
  const { delivered } = await sendEmail({
    to: email,
    subject: "Verify your Deskly email",
    text: `Welcome to Deskly! Confirm your email to start working tickets:\n\n${verifyUrl}\n\nThis link expires in 24 hours.`,
  });

  // With no email provider (demo), surface the link so the flow is testable.
  return ok({ verifyUrl: delivered ? null : verifyUrl });
}

export async function verifyEmailAction(raw: unknown): Promise<ActionResult> {
  const parsed = verifyEmailSchema.safeParse(raw);
  if (!parsed.success) return fail("Invalid verification link.");

  const record = await prisma.emailVerificationToken.findUnique({
    where: { tokenHash: hashToken(parsed.data.token) },
  });
  if (!record || record.usedAt || record.expires < new Date()) {
    return fail("This verification link is invalid or has expired.");
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { emailVerified: new Date() },
    }),
    prisma.emailVerificationToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
  ]);
  return ok(undefined);
}

export async function resendVerificationAction(
  rawEmail: unknown,
): Promise<ActionResult<{ verifyUrl: string | null }>> {
  const parsed = forgotPasswordSchema.safeParse({ email: rawEmail });
  if (!parsed.success) return fail("Enter a valid email address.");

  const ip = clientIp(await headers());
  const limit = rateLimit(`resend:${ip}:${parsed.data.email}`, 5, 15 * 60 * 1000);
  if (!limit.ok) return fail(`Too many attempts. Try again in ${limit.retryAfter}s.`);

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user || user.emailVerified) {
    return ok({ verifyUrl: null });
  }

  const { token, tokenHash } = createToken();
  await prisma.emailVerificationToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expires: new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS),
    },
  });
  const verifyUrl = absoluteUrl(`/verify?token=${token}`);
  const { delivered } = await sendEmail({
    to: user.email,
    subject: "Verify your Deskly email",
    text: `Confirm your email:\n\n${verifyUrl}`,
  });
  return ok({ verifyUrl: delivered ? null : verifyUrl });
}

// ───────────────────────────── Password reset ───────────────────────────────

export async function requestPasswordResetAction(
  raw: unknown,
): Promise<ActionResult<{ resetUrl: string | null }>> {
  const parsed = forgotPasswordSchema.safeParse(raw);
  if (!parsed.success) {
    return fail("Enter a valid email address.", fieldErrorsOf(parsed.error));
  }

  const ip = clientIp(await headers());
  const limit = rateLimit(`reset:${ip}:${parsed.data.email}`, 5, 15 * 60 * 1000);
  if (!limit.ok) return fail(`Too many attempts. Try again in ${limit.retryAfter}s.`);

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });

  // Always return success — never reveal whether an account exists.
  if (!user?.passwordHash) return ok({ resetUrl: null });

  const { token, tokenHash } = createToken();
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expires: new Date(Date.now() + PASSWORD_RESET_TTL_MS),
    },
  });
  const resetUrl = absoluteUrl(`/reset-password?token=${token}`);
  const { delivered } = await sendEmail({
    to: user.email,
    subject: "Reset your Deskly password",
    text: `Reset your password (link expires in 20 minutes):\n\n${resetUrl}`,
  });
  // Demo-only: surface the link when no email provider is configured.
  return ok({ resetUrl: delivered ? null : resetUrl });
}

export async function resetPasswordAction(raw: unknown): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse(raw);
  if (!parsed.success) {
    return fail("Please choose a valid new password.", fieldErrorsOf(parsed.error));
  }

  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(parsed.data.token) },
  });
  if (!record || record.usedAt || record.expires < new Date()) {
    return fail("This reset link is invalid or has expired.");
  }

  const passwordHash = await hashPassword(parsed.data.password);
  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
    // Invalidate any other outstanding reset tokens for this user.
    prisma.passwordResetToken.deleteMany({
      where: { userId: record.userId, usedAt: null, id: { not: record.id } },
    }),
  ]);
  return ok(undefined);
}
